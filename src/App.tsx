import React, {useEffect, useState} from 'react';

import {
  Alert,
  Button,
  NativeEventEmitter,
  NativeModules,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import BleManager, {PeripheralInfo} from 'react-native-ble-manager';

import Battery from './Battery';
import BoardHeader from './BoardHeader';
import ConfigEditor from './ConfigEditor';
import {ConnectionState} from './ConnectionState';
import ConnectionStatus from './ConnectionStatus';
import ModeSelection from './ModeSelection';
import {AppConfig, SavedBoard, StorageService} from './StorageService';
import Telemetry from './Telemetry';
import {Typography} from './Typography';

import {ONEWHEEL_SERVICE_UUID} from './ble';
const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const scanDuration = 2;

const App = () => {
  const [connectionState, setConnectionState] = useState(
    ConnectionState.DISCONNECTED,
  );
  const [connectedDevice, setConnectedDevice] = useState<
    PeripheralInfo | undefined
  >(undefined);
  const [config, setConfig] = useState<AppConfig | undefined>(undefined);
  const [devices, setDevices] = useState<PeripheralInfo[]>([]);
  const [connectedBoard, setConnectedBoard] = useState<SavedBoard | undefined>(
    undefined,
  );
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([]);

  async function scan(deviceId?: string): Promise<PeripheralInfo[]> {
    try {
      await BleManager.scan([ONEWHEEL_SERVICE_UUID], scanDuration, false).catch(
        () => {},
      );
      setConnectionState(ConnectionState.SCANNING);
      console.debug('Scan started.');
      let found: PeripheralInfo[] = [];
      const refresh = setInterval(async () => {
        found = await BleManager.getDiscoveredPeripherals();
        console.debug('Devices:', found);
        if (deviceId && found.some(d => d.id === deviceId)) {
          clearInterval(refresh);
        }
      }, 250);

      await new Promise(res =>
        setTimeout(() => res(true), scanDuration * 1000),
      );
      clearInterval(refresh);
      console.debug('Scan complete.');
      setConnectionState(ConnectionState.DISCONNECTED);
      if (deviceId != null && found.every(d => d.id !== deviceId)) {
        console.warn(
          `Unable to locate ${deviceId}. Will not be able to autoconnect.`,
        );
      }
      if (found.length === 0) {
        Alert.alert(
          'No devices found',
          'There were no devices found within range.\nMake sure your onewheel is powered on and not connected to another application.',
        );
      }
      setDevices(found);
      return found;
    } catch (err) {
      console.error('Failed to scan for bt devices.', err);
      setDevices([]);
      return [];
    }
  }

  async function connect(
    deviceId: string,
    scannedDevices: PeripheralInfo[],
  ): Promise<PeripheralInfo> {
    console.debug(`Attempting connection to ${deviceId}`);
    try {
      if (scannedDevices.every(d => d.id !== deviceId)) {
        throw new Error(`Device ${deviceId} not detected`);
      }
      await BleManager.connect(deviceId);
      const connected = await BleManager.retrieveServices(deviceId);
      if (connected == null) {
        throw new Error('Connection failed');
      }
      console.debug('Connected: ', connected.name ?? 'unknown');
      setConnectedDevice(connected);
      setConnectionState(ConnectionState.CONNECTED);
      return connected;
    } catch (err: any) {
      setConnectionState(ConnectionState.DISCONNECTED);
      throw new Error(err);
    }
  }

  // Initial setup.
  useEffect(() => {
    const init = async () => {
      const savedConfig = await StorageService.getAppConfig();
      setConfig(savedConfig);
      console.debug('Got saved configuration ->', savedConfig);
      await BleManager.start({showAlert: true});
      console.debug('BT Initialized.');
      await new Promise(res => setTimeout(() => res(true), 100));
      // Setup disconnection listener.
      BleManagerEmitter.addListener(
        'BleManagerDisconnectPeripheral',
        ({peripheral}) => {
          console.debug(`Disconnection: ${JSON.stringify(peripheral)}`);
          setConnectionState(ConnectionState.DISCONNECTED);
          setConnectedDevice(undefined);
          setDevices([]);
          Alert.alert(
            'Device Disconnected',
            'The application has lost connection to the OneWheel.',
          );
        },
      );
      // Fetch any saved boards and attempt to autoconnect.
      const saved = await StorageService.getSavedBoards();
      setSavedBoards(saved);
      const {autoconnect} = savedConfig;
      const scanned = await scan();
      // Observe autoconnect priority.
      // @FIXME: optimize this to only traverse scanned once.
      const found = autoconnect.find(id => scanned.find(dev => dev.id === id));
      if (found != null) {
        await connect(found, scanned);
      }
    };
    init().catch(err => console.error(err));
  }, []);

  return (
    <SafeAreaView
      style={{...styles.base, backgroundColor: Typography.colors.white}}>
      <StatusBar
        barStyle={'light-content'}
        // barStyle={this.state.isDarkMode ? 'light-content' : 'dark-content'}
        // backgroundColor={this.state.backgroundStyle.backgroundColor}
      />
      <View style={{backgroundColor: Typography.colors.white}}>
        <View style={styles.header}>
          <ConfigEditor
            style={styles.configButton}
            handleConfigUpdate={updated => {
              StorageService.updateAppConfig(updated).then(saved =>
                setConfig(saved),
              );
            }}
            config={config!}
          />
          <Text style={styles.logo}>
            <Text
              style={{
                color: Typography.colors.emerald,
                fontSize: Typography.fontsize.xl,
              }}>
              ow
            </Text>
            <Text style={{fontSize: Typography.fontsize.xl}}>.rn</Text>
          </Text>
          <Text style={{...Typography.emptyFlex}} />
        </View>
        <View>
          {connectionState === ConnectionState.CONNECTED || config?.debug ? (
            <View style={{...styles.fullscreen}}>
              <BoardHeader
                board={connectedBoard}
                handleSave={async () => {
                  const board = await StorageService.getBoard(
                    connectedDevice!.id,
                  );
                  setConnectedBoard(board);
                }}
                connectedDevice={connectedDevice}
              />

              <Battery config={config} device={connectedDevice} />
              <Telemetry
                config={config}
                board={connectedBoard}
                device={connectedDevice}
              />
              <ModeSelection device={connectedDevice} />
            </View>
          ) : (
            // <ModeSelection device={this.state.connectedDevice} />
            <View style={styles.fullscreen}>
              <ConnectionStatus
                style={{fontSize: Typography.fontsize.xxl}}
                status={connectionState}
              />
              <Button
                color={Typography.colors.emerald}
                title={
                  connectionState === ConnectionState.DISCONNECTED
                    ? 'Start Scanning'
                    : connectionState === ConnectionState.SCANNING
                    ? 'Scanning...'
                    : connectionState === ConnectionState.CONNECTING
                    ? 'Connecting...'
                    : ''
                }
                disabled={[
                  ConnectionState.SCANNING,
                  ConnectionState.CONNECTING,
                ].some(v => v === connectionState)}
                onPress={() => {
                  scan().catch(err => {
                    console.error(err);
                  });
                }}
              />
              {devices.map(dev => (
                <Button
                  title={
                    savedBoards.find(d => d.id === dev.id)?.name ??
                    dev.name ??
                    dev.id
                  }
                  key={dev.id}
                  disabled={connectionState !== ConnectionState.DISCONNECTED}
                  onPress={() => {
                    connect(dev.id, devices).catch(err => {
                      console.error(err);
                    });
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: Typography.nativeFonts,
  },
  configButton: {flex: 1, paddingLeft: 20},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: Typography.fontsize.xl,
  },
  logo: {flex: 1, left: -5},
  fullscreen: {
    marginTop: '5%',
    height: '100%',
    alignItems: 'center',
  },
});

export default App;

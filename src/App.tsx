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
import {ConnectionState} from './util/ConnectionState';
import ConnectionStatus from './ConnectionStatus';
import ModeSelection from './ModeSelection';
import {AppConfig, SavedBoard, StorageService} from './StorageService';
import Telemetry from './Telemetry';
import {Themes, Typography} from './Typography';

import {ONEWHEEL_SERVICE_UUID} from './util/bluetooth';
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
      let found = (await StorageService.getSavedBoards()).find(
        b => b.id === deviceId,
      );
      if (!found) {
        found = {
          id: deviceId,
          name: deviceId,
          autoconnect: true,
          wheelSize: 10.5, // @fixme: Determine wheel size based on board generation.
        };
        await StorageService.saveBoard(found);
      }
      setConnectedBoard(found);
      return connected;
    } catch (err: any) {
      setConnectionState(ConnectionState.DISCONNECTED);
      throw new Error(err);
    }
  }

  // FIXME: Proper theming based off config.
  const theme = Themes.light;
  // const systemTheme = useColorScheme();
  // const theme =
  //   config?.theme === 'system'
  //     ? Themes[systemTheme ?? 'light']
  //     : config?.theme === 'dark'
  //     ? Themes.dark
  //     : Themes.light;

  // Initial setup.
  useEffect(() => {
    const init = async () => {
      const savedConfig = await StorageService.getAppConfig();
      setSavedBoards((await StorageService.getSavedBoards()) ?? []);
      setConfig(savedConfig);
      console.debug('Got saved configuration ->', savedConfig);
      await BleManager.start({showAlert: true});
      console.debug('BT Initialized.');
      await new Promise(res => setTimeout(() => res(true), 100));
      // Required for Android.
      try {
        await BleManager.enableBluetooth();
      } catch (err) {
        // Unsupported in iOS.
        if (err !== 'Not supported') {
          console.error(err);
        }
      }
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
      const {autoconnect} = savedConfig;
      const scanned = await scan();
      // Observe autoconnect priority.
      // @FIXME: optimize this to only traverse scanned once.
      const found = autoconnect.find(id => scanned.find(dev => dev.id === id));
      if (found != null) {
        setConnectionState(ConnectionState.CONNECTING);
        await connect(found, scanned);
      }
    };
    init().catch(err => console.error(err));
  }, []);

  return (
    <SafeAreaView style={theme}>
      <StatusBar
        barStyle={config?.theme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={theme}>
        <View
          style={{
            ...styles.header,
            ...theme,
          }}>
          {config != null ? (
            <View style={{flex: 1}}>
              <ConfigEditor
                style={theme}
                handleConfigUpdate={updated => {
                  StorageService.updateAppConfig(updated).then(() =>
                    setConfig(updated),
                  );
                }}
                config={config}
              />
            </View>
          ) : (
            <></>
          )}
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
                handleSave={async updated => {
                  setConnectedBoard(updated);
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
                  color={Typography.colors.emerald}
                  disabled={connectionState !== ConnectionState.DISCONNECTED}
                  onPress={() => {
                    setConnectionState(ConnectionState.CONNECTING);
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
  logo: {flex: 1},
  fullscreen: {
    marginTop: '5%',
    height: '100%',
    alignItems: 'center',
  },
});

export default App;

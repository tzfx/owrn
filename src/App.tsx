import React, {Component} from 'react';
import {
  Alert,
  Button,
  NativeEventEmitter,
  NativeModules,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {ONEWHEEL_SERVICE_UUID} from './rewheel/ble';
import {StorageService, SavedBoard} from './StorageService';

import Battery from './Battery';
import BoardHeader from './BoardHeader';
import {ConnectionState} from './ConnectionState';
import ConnectionStatus from './ConnectionStatus';
import ModeSelection from './ModeSelection';
import Telemetry from './Telemetry';

import BleManager, {PeripheralInfo} from 'react-native-ble-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Typography} from './Typography';
const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

interface State {
  connectedDevice?: PeripheralInfo;
  connectionState: ConnectionState;
  devices: any[];
  isConnected: boolean;
  isDarkMode: boolean;
  backgroundStyle: {
    backgroundColor: string;
  };
  boardsaved: boolean;
  board?: SavedBoard;
  savedBoards: SavedBoard[];
}

class App extends Component<{}, State> {
  state: Readonly<State> = {
    connectionState: ConnectionState.DISCONNECTED,
    devices: [],
    savedBoards: [],
    isConnected: false,
    isDarkMode: false,
    backgroundStyle: {
      backgroundColor: Colors.lighter,
    },
    boardsaved: false,
  };

  private debug = true;

  // Seconds to scan for a valid device.
  private readonly scanDuration = 1;

  private async tryBTScan(deviceId?: string): Promise<void> {
    this.setState({connectionState: ConnectionState.SCANNING});
    try {
      await BleManager.scan(
        [ONEWHEEL_SERVICE_UUID],
        this.scanDuration,
        false,
      ).catch(() => {});
      console.debug('Scan started.');

      const refresh = setInterval(async () => {
        const devices = await BleManager.getDiscoveredPeripherals();
        console.debug('Devices:', devices);
        this.setState({devices});
        if (deviceId && devices.some(d => d.id === deviceId)) {
          clearInterval(refresh);
        }
      }, 250);

      await new Promise(res =>
        setTimeout(() => res(true), this.scanDuration * 1000),
      );
      clearInterval(refresh);
      this.setState({connectionState: ConnectionState.DISCONNECTED});

      if (
        deviceId != null &&
        this.state.devices.every(d => d.id !== deviceId)
      ) {
        console.warn(
          `Unable to locate ${deviceId}. Will not be able to autoconnect.`,
        );
      }
      if (this.state.devices.length === 0) {
        Alert.alert(
          'No devices found',
          'There were no devices found within range.\nMake sure your onewheel is powered on and not connected to another application.',
        );
      }
    } catch (err) {
      console.error('Failed to scan for bt devices.', err);
    }
  }

  private async connect(deviceId: string): Promise<void> {
    console.debug(`Attempting connection to ${deviceId}`);
    this.setState({connectionState: ConnectionState.CONNECTING}, async () => {
      try {
        if (this.state.devices.every(d => d.id !== deviceId)) {
          throw new Error(`Device ${deviceId} not detected`);
        }
        await BleManager.connect(deviceId);
        const connectedDevice = await BleManager.retrieveServices(deviceId);
        if (connectedDevice == null) {
          throw new Error('Connection failed');
        }
        console.debug('Connected: ', connectedDevice.name ?? 'unknown');
        this.setState({
          connectionState: ConnectionState.CONNECTED,
          connectedDevice,
          isConnected: true,
          boardsaved: true,
        });
      } catch (err) {
        this.setState({
          connectionState: ConnectionState.DISCONNECTED,
        });
        console.error(err);
      }
    });
  }

  async componentDidMount(): Promise<void> {
    // IIFE hack so hooks work...
    (async () => {
      const isDarkMode = useColorScheme() === 'dark';
      const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
      };

      this.setState({backgroundStyle, isDarkMode});
    })().catch(() => {}); // NOOP.

    if (this.debug) {
      await AsyncStorage.clear();
    }

    // Initialize Bluetooth Manager
    try {
      await BleManager.start({showAlert: true});
      // wait 100ms
      await new Promise(res => setTimeout(() => res(true), 100));
      console.debug('Bluetooth initialized.');
      BleManagerEmitter.addListener(
        'BleManagerDisconnectPeripheral',
        ({peripheral}) => {
          console.debug(`Disconnection: ${JSON.stringify(peripheral)}`);
          if (this.state.connectedDevice?.id === peripheral) {
            this.setState(
              {
                connectionState: ConnectionState.DISCONNECTED,
                connectedDevice: undefined,
                isConnected: false,
                devices: [],
              },
              () => {
                Alert.alert(
                  'Device Disconnected',
                  'The application has lost connection to the OneWheel.',
                );
              },
            );
          }
        },
      );
      const savedBoards = await StorageService.getSavedBoards();
      const board = savedBoards.find(b => b.autoconnect);
      this.setState({savedBoards, board});
      if (board?.id != null) {
        await this.tryBTScan(board.id);
        await this.connect(board.id);
      }
    } catch (err) {
      console.error('Bluetooth failed to start!!', err);
    }
  }

  render(): JSX.Element {
    return (
      <SafeAreaView style={{...styles.base, ...this.state.backgroundStyle}}>
        <StatusBar
          barStyle={this.state.isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={this.state.backgroundStyle.backgroundColor}
        />
        <View style={this.state.backgroundStyle}>
          <Text style={styles.header}>
            <Text style={{color: Typography.colors.emerald}}>ow</Text>.rn
          </Text>
          <View>
            {this.state.isConnected || this.debug === true ? (
              <View
                style={{...this.state.backgroundStyle, ...styles.fullscreen}}>
                <BoardHeader
                  board={this.state.board}
                  handleSave={async () => {
                    const board = await StorageService.getBoard(
                      this.state.connectedDevice!.id,
                    );
                    this.setState({board});
                  }}
                  connectedDevice={this.state.connectedDevice}
                />

                <Battery device={this.state.connectedDevice} />
                <Telemetry
                  board={this.state.board}
                  device={this.state.connectedDevice}
                />
                <ModeSelection device={this.state.connectedDevice} />
              </View>
            ) : (
              // <ModeSelection device={this.state.connectedDevice} />
              <View style={styles.fullscreen}>
                <ConnectionStatus
                  style={styles.largest}
                  status={this.state.connectionState}
                />
                <Button
                  title={
                    this.state.connectionState === ConnectionState.DISCONNECTED
                      ? 'Start Scanning'
                      : this.state.connectionState === ConnectionState.SCANNING
                      ? 'Scanning...'
                      : this.state.connectionState ===
                        ConnectionState.CONNECTING
                      ? 'Connecting...'
                      : ''
                  }
                  disabled={[
                    ConnectionState.SCANNING,
                    ConnectionState.CONNECTING,
                  ].some(v => v === this.state.connectionState)}
                  onPress={() => {
                    this.tryBTScan().catch(err => {
                      console.error(err);
                    });
                  }}
                />
                {this.state.devices.map(dev => (
                  <Button
                    title={
                      this.state.savedBoards.find(d => d.id === dev.id)?.name ??
                      dev.name ??
                      dev.id
                    }
                    key={dev.id}
                    disabled={
                      this.state.connectionState !==
                      ConnectionState.DISCONNECTED
                    }
                    onPress={() => {
                      this.connect(dev.id).catch(err => {
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
  }
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Typography.nativeFonts,
  },
  fullscreen: {
    marginTop: '10%',
    height: '100%',
    alignItems: 'center',
  },
  header: {fontSize: Typography.fontsize.xl, textAlign: 'center'},
});

export default App;

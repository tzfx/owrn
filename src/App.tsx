import AsyncStorage from '@react-native-async-storage/async-storage';
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
import BleManager, {PeripheralInfo} from 'react-native-ble-manager';
import {Colors} from 'react-native/Libraries/NewAppScreen';
const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);
// import ModeSelection from './ModeSelection';
import Battery from './Battery';
import {ConnectionState} from './ConnectionState';
import ConnectionStatus from './ConnectionStatus';
import ModeSelection from './ModeSelection';
import {ONEWHEEL_SERVICE_UUID} from './rewheel/ble';
import Telemetry from './Telemetry';
import BoardHeader from './BoardHeader';

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
}

class App extends Component<{}, State> {
  state: Readonly<State> = {
    connectionState: ConnectionState.DISCONNECTED,
    devices: [],
    isConnected: false,
    isDarkMode: false,
    backgroundStyle: {
      backgroundColor: Colors.lighter,
    },
    boardsaved: false,
  };

  // Seconds to scan for a valid device.
  private readonly scanDuration = 5;

  private readonly storageid_savedboard = 'owrn-saved-board';

  private async tryBTScan(): Promise<void> {
    this.setState({connectionState: ConnectionState.SCANNING});
    try {
      await BleManager.scan(
        [ONEWHEEL_SERVICE_UUID],
        this.scanDuration,
        false,
      ).catch(() => {});
      // await BleManager.scan([], this.scanDuration, false);
      console.debug('Scan started.');

      const deviceRefresh = setInterval(async () => {
        const devices = await BleManager.getDiscoveredPeripherals();
        console.debug('Devices:', devices);
        this.setState({devices});
      }, (this.scanDuration / 4) * 1000);
      setTimeout(() => {
        console.debug('Scan stopped.');
        clearInterval(deviceRefresh);
        this.setState({connectionState: ConnectionState.DISCONNECTED});
        if (this.state.devices.length === 0) {
          Alert.alert(
            'No devices found',
            'There were no devices found within range.\nMake sure your onewheel is powered on and not connected to another application.',
          );
        }
      }, this.scanDuration * 1000);
    } catch (err) {
      console.error('Failed to scan for bt devices.', err);
    }
  }

  private async connect(deviceId: string): Promise<void> {
    console.debug(`Attempting connection to ${deviceId}`);
    this.setState({connectionState: ConnectionState.CONNECTING}, async () => {
      try {
        await BleManager.connect(deviceId);
        const connectedDevice = await BleManager.retrieveServices(deviceId);
        if (connectedDevice == null) {
          throw new Error('Connection failed');
        }
        console.debug('Connected:', connectedDevice.name ?? 'idk');
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
        Alert.alert(
          'Unabled to autoconnect.',
          'Unable to autoconnect to saved board. Please make sure the board is turned on and try to scan.',
        );
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

    // Initialize Bluetooth Manager
    try {
      await BleManager.start({showAlert: true});
      console.debug('Bluetooth initialized.');
      BleManagerEmitter.addListener(
        'BleManagerDisconnectPeripheral',
        (peripheral: string) => {
          if (this.state.connectedDevice?.id === peripheral) {
            this.setState(
              {
                connectionState: ConnectionState.DISCONNECTED,
                connectedDevice: undefined,
                isConnected: false,
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
      const saved = await AsyncStorage.getItem(this.storageid_savedboard);
      if (saved != null) {
        this.connect(saved);
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
            <Text style={styles.green}>ow</Text>.rn
          </Text>
          <View>
            {this.state.isConnected ? (
              <View
                style={{...this.state.backgroundStyle, ...styles.fullscreen}}>
                <BoardHeader
                  autoconnect={this.state.boardsaved}
                  connectedDevice={this.state.connectedDevice}
                />

                <Battery device={this.state.connectedDevice} />
                <Telemetry
                  autoconnect={this.state.boardsaved}
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
                    title={dev.name ?? dev.id}
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
    fontFamily:
      '-apple-system, ".SFNSText-Regular", "San Francisco", "Roboto", "Segoe UI", "Helvetica Neue", "Lucida Grande", sans-serif',
  },
  fullscreen: {
    marginTop: '10%',
    height: '100%',
    alignItems: 'center',
  },
  large: {fontSize: 36},
  larger: {fontSize: 42},
  largest: {fontSize: 64},
  green: {color: '#56bf81'},
  header: {fontSize: 42, textAlign: 'center'},
});

export default App;

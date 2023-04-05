import React, {Component} from 'react';

import {Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './rewheel/ble';
import {Buffer} from '@craftzdog/react-native-buffer';

interface Props {
  device?: PeripheralInfo;
}

interface State {
  cells?: any;
  serial?: any;
  percent?: number;
  temperature?: any;
  voltage?: number;
}

class Battery extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  private CtoF(temperature: number) {
    return +(temperature * (9 / 5) + 32).toFixed(1);
  }

  private refreshBatteryStats() {
    if (this.props.device != null) {
      return Promise.all([
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.batteryCells,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.batteryPercent,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.batterySerialNumber,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.batteryTemperature,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.batteryVoltage,
        ),
      ]).then(([rcells, rpercent, rserial, rtemp, rvoltage]) => {
        const [_bcells, bpercent, bserial, btemp, bvoltage] = [
          // _bcells unused until I figure out how to calculate the output.
          Buffer.from(rcells),
          Buffer.from(rpercent),
          Buffer.from(rserial),
          Buffer.from(rtemp),
          Buffer.from(rvoltage),
        ];
        this.setState({
          percent: bpercent.readUInt8(1),
          serial: bserial.readUInt16BE(0),
          temperature: btemp.readUInt8(0),
          voltage: bvoltage.readInt16BE(0) / 10,
        });
      });
    }
    return Promise.reject('No device connected.');
  }

  async componentDidMount(): Promise<void> {
    await this.refreshBatteryStats().catch(err => console.error(err));
    setInterval(() => this.refreshBatteryStats(), 30_000);
  }

  render(): JSX.Element {
    // Render mode selection based on OW generation.
    return (
      <View>
        <Text>Percent: {this.state.percent}%</Text>
        <Text>Serial: {this.state.serial}</Text>
        <Text>Temperature: {this.CtoF(this.state.temperature)}&deg;F</Text>
        <Text>Voltage: {this.state.voltage}v</Text>
      </View>
    );
  }
}

export default Battery;

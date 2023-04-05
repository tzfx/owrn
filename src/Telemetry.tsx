import React, {Component} from 'react';

import {Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './rewheel/ble';
import {Buffer} from '@craftzdog/react-native-buffer';

interface Props {
  device?: PeripheralInfo;
}

interface State {
  ca?: number;
  lah?: number;
  lo?: number;
  p?: number;
  r?: number;
  rpm?: number;
  tah?: number;
  trah?: number;
  tro?: number;
  y?: number;
}

class Telemetry extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  private refreshTelemetry() {
    if (this.props.device != null) {
      return Promise.all([
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.currentAmps,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.lifetimeAmpHours,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.lifetimeOdometer,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.pitch,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.roll,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.rpm,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.tripAmpHours,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.tripOdometer,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.tripRegenAmpHours,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.yaw,
        ),
      ]).then(([rca, rlah, rlo, rp, rr, rrpm, rtah, rto, rtrah, ry]) => {
        const [bca, blah, blo, bp, br, brpm, btah, bto, btrah, by] = [
          // _bcells unused until I figure out how to calculate the output.
          Buffer.from(rca),
          Buffer.from(rlah),
          Buffer.from(rlo),
          Buffer.from(rp),
          Buffer.from(rr),
          Buffer.from(rrpm),
          Buffer.from(rtah),
          Buffer.from(rto),
          Buffer.from(rtrah),
          Buffer.from(ry),
        ];
        this.setState({
          ca: bca.readUInt16BE(0),
          lah: blah.readUInt16BE(0),
          lo: blo.readUInt16BE(0),
          p: +(bp.readUInt16BE(0) / 100).toFixed(2),
          r: +((br.readUInt16BE(0) - 1800) / 10).toFixed(2),
          rpm: brpm.readUInt16BE(0),
          tah: +(btah.readUInt16BE(0) * 0.0001).toFixed(4),
          tro: bto.readUInt16BE(0),
          trah: btrah.readUInt16BE(0),
          y: +((by.readUInt16BE(0) - 2700) / 10).toFixed(2),
        });
      });
    }
    return Promise.reject('No device connected.');
  }

  async componentDidMount(): Promise<void> {
    await this.refreshTelemetry().catch(err => console.error(err));
    setInterval(() => this.refreshTelemetry(), 5_000);
  }

  render(): JSX.Element {
    // Render mode selection based on OW generation.
    return (
      <View>
        <Text>Current:</Text>
        <Text>Amps: {this.state.ca}</Text>
        <Text>Pitch: {this.state.p}</Text>
        <Text>Roll: {this.state.r}</Text>
        <Text>Yaw: {this.state.y}</Text>
        <Text>RPM: {this.state.rpm}</Text>
        <Text>Trip:</Text>
        <Text>Mileage: {this.state.tro}</Text>
        <Text>Ah: {this.state.tah}</Text>
        <Text>Regen Ah: {this.state.trah}</Text>
        <Text>Lifetime:</Text>
        <Text>Mileage: {this.state.lo}</Text>
        <Text>Ah: {this.state.lah}</Text>
      </View>
    );
  }
}

export default Telemetry;

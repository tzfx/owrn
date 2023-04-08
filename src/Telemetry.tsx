import React, {Component} from 'react';

import {Buffer} from '@craftzdog/react-native-buffer';
import {Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './rewheel/ble';
import {VictoryPie, VictoryPolarAxis} from 'victory-native';

interface Props {
  device?: PeripheralInfo;
  debug?: boolean;
}

interface State {
  ca?: number;
  lah?: number;
  lo?: number;
  p?: number;
  r?: number;
  rpm: number;
  tah?: number;
  trah?: number;
  tro?: number;
  y?: number;
  topSpeed: number;
}

class Telemetry extends Component<Props, State> {
  #odoPoller?: number;
  #rpmPoller?: number;

  // full telemetry for debugging.
  #telemetryPoller?: number;

  constructor(props: Props) {
    super(props);
    this.state = {
      lo: 0,
      rpm: 0,
      topSpeed: 0.0,
      tro: 0,
    };
  }

  private calculateSpeed(rpm: number, diameter: number = 11) {
    return (diameter * Math.PI * rpm * 60) / 5_280 / 10;
  }

  private refreshRPM() {
    if (this.props.device != null) {
      return BTManager.read(
        this.props.device.id,
        ONEWHEEL_SERVICE_UUID,
        CHARACTERISTICS.rpm,
      )
        .then(rrpm => {
          const brpm = Buffer.from(rrpm);
          this.setState({rpm: brpm.readUInt16BE(0)});
        })
        .catch(() => {
          if (this.#rpmPoller != null) {
            clearInterval(this.#rpmPoller);
          }
        });
    }
    return Promise.reject('No device connected.');
  }

  private refreshOdometers() {
    if (this.props.device != null) {
      return Promise.all([
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.lifetimeOdometer,
        ),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.tripOdometer,
        ),
      ])
        .then(([rlo, rto]) => {
          const [blo, bto] = [Buffer.from(rlo), Buffer.from(rto)];
          this.setState({
            lo: blo.readUInt16BE(0),
            tro: bto.readUInt16BE(0),
          });
        })
        .catch(() => {
          if (this.#odoPoller != null) {
            clearInterval(this.#odoPoller);
          }
        });
    }
    return Promise.reject('No device connected.');
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
      ])
        .then(([rca, rlah, rlo, rp, rr, rrpm, rtah, rto, rtrah, ry]) => {
          const [bca, blah, blo, bp, br, brpm, btah, bto, btrah, by] = [
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
        })
        .catch(() => {
          if (this.#telemetryPoller != null) {
            clearInterval(this.#telemetryPoller);
          }
        });
    }
    return Promise.reject('No device connected.');
  }

  async componentDidMount(): Promise<void> {
    if (this.props.debug) {
      await this.refreshTelemetry().catch(err => console.error(err));
      this.#telemetryPoller = setInterval(() => this.refreshTelemetry(), 5_000);
    } else {
      await this.refreshOdometers().catch(err => console.error(err));
      this.#odoPoller = setInterval(() => this.refreshOdometers(), 1_000);
      await this.refreshRPM().catch(err => console.error(err));
      this.#rpmPoller = setInterval(() => this.refreshRPM(), 500);
    }
  }

  componentDidUpdate(): void {
    const speed = this.calculateSpeed(this.state.rpm);
    if (speed > this.state.topSpeed) {
      this.setState({topSpeed: speed});
    }
  }

  componentWillUnmount(): void {
    if (this.#rpmPoller != null) {
      clearInterval(this.#rpmPoller);
    }
    if (this.#telemetryPoller != null) {
      clearInterval(this.#telemetryPoller);
    }
  }

  render(): JSX.Element {
    const speed = this.calculateSpeed(this.state.rpm);
    // Render mode selection based on OW generation.
    return (
      <View>
        <VictoryPie
          height={350}
          startAngle={90}
          endAngle={270}
          innerRadius={75}
          labels={({datum}) =>
            datum.x !== '' ? (datum.y ?? 0).toFixed(1) + ' MPH' : ''
          }
          labelRadius={() => -45}
          style={{
            labels: {fontSize: 24},
            data: {
              fill: ({datum}) => (datum.x === '' ? 'lightgrey' : '#457b9d'),
            },
            parent: {
              marginTop: -160,
            },
          }}
          data={[
            {x: '', y: 20.0 - speed},
            {x: 'speed', y: speed},
          ]}
        />
        <VictoryPolarAxis
          style={{
            parent: {marginTop: -350},
            axis: {stroke: 'black'},
            grid: {stroke: () => 'black'},
          }}
          innerRadius={75}
          startAngle={180}
          endAngle={180 + (this.state.topSpeed / 20.0) * 180}
          minDomain={0}
          maxDomain={20}
          tickValues={[0, +this.state.topSpeed.toFixed(1)]}
          height={350}
        />
        <Text style={{textAlign: 'right'}}>
          {this.state.lo} mi, {this.state.topSpeed.toFixed(1)} &and;
        </Text>
        {!this.props.debug ?? (
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
        )}
      </View>
    );
  }
}

export default Telemetry;

import React, {Component} from 'react';

import {Buffer} from '@craftzdog/react-native-buffer';
import {Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {VictoryBoxPlot, VictoryPie} from 'victory-native';
import {AppConfig} from './StorageService';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './util/bluetooth';

interface Props {
  device?: PeripheralInfo;
  debug?: boolean;
  config?: AppConfig;
}

interface State {
  cells?: any;
  serial?: any;
  percent?: number;
  temperature?: any;
  voltage?: number;
}

class Battery extends Component<Props, State> {
  #batteryPoller?: number;

  constructor(props: Props) {
    super(props);
    this.state = {
      percent: 0,
      voltage: 52,
      temperature: 20.55,
    };
  }

  private CtoF(temperature: number) {
    return temperature * (9 / 5) + 32;
  }

  private colorScale(value: number, max: number = 100): string {
    // https://coolors.co/e96060-e2852d-f3e189-abc274-359621
    const percent = value / max;
    if (percent > 0.75) {
      return '#359621';
    }
    if (percent > 0.45) {
      return '#abc274';
    }
    if (percent > 0.3) {
      return '#f3E189';
    }
    if (percent > 0.2) {
      return '#e2852d';
    }
    return '#e96060';
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
      ])
        .then(([rcells, rpercent, rserial, rtemp, rvoltage]) => {
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
        })
        .catch(() => {
          if (this.#batteryPoller != null) {
            clearInterval(this.#batteryPoller);
          }
        });
    }
    return Promise.reject('No device connected.');
  }

  async componentDidMount(): Promise<void> {
    await this.refreshBatteryStats()
      .then(
        () =>
          (this.#batteryPoller = setInterval(
            () => this.refreshBatteryStats(),
            30_000,
          )),
      )
      .catch(err => console.error(err));
  }

  componentWillUnmount(): void {
    if (this.#batteryPoller != null) {
      clearInterval(this.#batteryPoller);
    }
  }

  render(): JSX.Element {
    // Render mode selection based on OW generation.
    return (
      <View style={{}}>
        <Text style={styles.tempLabel}>
          {(this.props.config?.temperatureUnit === 'F'
            ? this.CtoF(this.state.temperature)
            : this.props.config?.temperatureUnit === 'K'
            ? this.state.temperature + 273.15
            : this.state.temperature
          ).toFixed(1)}
          {this.props.config?.temperatureUnit !== 'K' ? '°' : ''}
          {this.props.config?.temperatureUnit}
          {this.state.temperature < 3 ? '🥶' : ''}
        </Text>
        <Text style={{...styles.chartPercentLabel}}>{this.state.percent}%</Text>
        <VictoryPie
          height={350}
          startAngle={90}
          endAngle={-90}
          innerRadius={75}
          labels={() => ''}
          style={{
            data: {
              fill: ({datum}) =>
                datum.x === '' ? 'lightgrey' : this.colorScale(datum.y),
            },
          }}
          data={[
            {x: '', y: 100 - (this.state.percent ?? 0)},
            {x: 'charge', y: this.state.percent},
          ]}
        />
        <VictoryBoxPlot
          horizontal
          height={50}
          style={{
            parent: {
              marginTop: -175,
            },
            medianLabels: {
              fontSize: 10,
            },
          }}
          medianLabels={() => this.state.voltage?.toFixed(1) + 'V'}
          data={[
            {
              x: '',
              min: 43.5,
              median: this.state.voltage,
              max: 62.25,
              q1: this.state.voltage! - 0.15,
              q3: this.state.voltage! + 0.15,
            },
          ]}
        />
        {!this.props.debug ?? (
          <View>
            <Text>Battery Stats</Text>
            <Text>Percent: {this.state.percent}%</Text>
            <Text>Serial: {this.state.serial}</Text>
            <Text>Temperature: {this.CtoF(this.state.temperature)}&deg;F</Text>
            <Text>Voltage: {this.state.voltage}V</Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = {
  chartPercentLabel: {
    fontSize: 36,
    marginTop: -50,
    marginLeft: 'auto',
    marginRight: 'auto',
    top: 175,
    left: 5,
  },
  tempLabel: {marginLeft: 40, top: 65},
};

export default Battery;

import React, {Component} from 'react';

import {Buffer} from '@craftzdog/react-native-buffer';
import {Button, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './rewheel/ble';
import {inferBoardFromHardwareRevision} from './rewheel/board';
// import { BoardGeneration } from "./rewheel/common/src";

// type RideMode = {
//   [key in BoardGenerationName]: number | RideMode;
// };

// function get<T>(obj: object, path: string): T {
//   const travel = (regexp: RegExp) =>
//     String.prototype.split
//       .call(path, regexp)
//       .filter(Boolean)
//       .reduce(
//         (res: any, key) => (res !== null && res !== undefined ? res[key] : res),
//         obj,
//       );
//   const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
//   return result;
// }

// model.mode <-
const modes: {
  [board: string]: {[mode: string]: {symbol: string; value: number}};
} = {
  // any: {
  // enterfactorymode: 0xcbcb,
  // calibratemotorold: 0xcccc,
  // calibratemotor: 0xcaea,
  // calibraterepair: 0xcaca,
  // factorymode: 0xcb,
  //   custom: 0x09,
  // },
  // v1: {
  //   classic: 0x01,
  //   extreme: 0x02,
  //   elevated: 0x03,
  // },
  xr: {
    sequoia: {symbol: '🌳', value: 0x04},
    cruz: {symbol: '🚢', value: 0x05},
    mission: {symbol: '🛕', value: 0x06},
    delirium: {symbol: '😵‍💫', value: 0x08},
    custom: {symbol: '🧰', value: 0x09},
  },
  pint: {
    redwood: {symbol: '🌳', value: 0x05},
    pacific: {symbol: '🌊', value: 0x06},
    elevated: {symbol: '⛰️', value: 0x07},
    skyline: {symbol: '🏙️', value: 0x08},
    custom: {symbol: '🧰', value: 0x09},
  },
};

interface Props {
  device?: PeripheralInfo;
}

interface State {
  setMode?: number;
}

class ModeSelection extends Component<Props, State> {
  boardType: string = 'pint';

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    if (this.props.device != null) {
      BTManager.read(
        this.props.device.id,
        ONEWHEEL_SERVICE_UUID,
        CHARACTERISTICS.hardwareRevision,
      ).then((rhwr: number[]) => {
        const bhwr = Buffer.from(rhwr);
        const hwRevision = bhwr.readUInt16BE(0);

        this.boardType =
          inferBoardFromHardwareRevision(hwRevision).toLowerCase();
        console.debug(
          `Retrieved board hardware revision: ${hwRevision} (${this.boardType})`,
        );
      });
      BTManager.read(
        this.props.device.id,
        ONEWHEEL_SERVICE_UUID,
        CHARACTERISTICS.rideMode,
      ).then(rMode => {
        const bMode = Buffer.from(rMode);
        const currentMode = bMode.readUInt8(1);
        console.debug(`Current ride mode: ${currentMode}`);
        this.setState({
          setMode: currentMode,
        });
      });
    }
  }

  async select(selection: string): Promise<void> {
    const modeValue = modes[this.boardType][selection].value;
    if (modeValue == null) {
      throw new Error(`Unable to retrieve value for mode ${selection}`);
    }
    const {device} = this.props;
    if (device == null) {
      throw new Error('No connected device.');
    }

    await BTManager.write(
      device.id,
      ONEWHEEL_SERVICE_UUID,
      CHARACTERISTICS.rideMode,
      [modeValue],
    ).catch(err => {
      console.error(err);
    });
    this.setState({setMode: modeValue});
  }

  private wrapIfSelected(title: string, mode: number) {
    if (this.state?.setMode === mode) {
      return `>>> ${title} <<<`;
    }
    return title;
  }

  render(): JSX.Element {
    // Render mode selection based on OW generation.
    return (
      <View>
        {Object.entries(modes[this.boardType]).map(
          ([mode, {symbol, value}]) => (
            <Button
              title={this.wrapIfSelected(
                `${symbol} ${mode[0].toUpperCase() + mode.slice(1)}`,
                value,
              )}
              key={mode}
              disabled={this.state?.setMode === value}
              onPress={() => {
                this.select(mode);
              }}
            />
          ),
        )}
      </View>
    );
  }
}

export default ModeSelection;

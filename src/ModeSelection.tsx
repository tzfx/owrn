import React, {Component} from 'react';

import {Button, Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './rewheel/ble';
import {
  type BoardGenerationName,
  BoardGeneration,
  inferBoardFromHardwareRevision,
} from './rewheel/board';
import {Buffer} from '@craftzdog/react-native-buffer';
// import { BoardGeneration } from "./rewheel/common/src";

type RideMode = {
  [key in BoardGenerationName]: number | RideMode;
};

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
const modes = {
  any: {
    // enterfactorymode: 0xcbcb,
    // calibratemotorold: 0xcccc,
    // calibratemotor: 0xcaea,
    // calibraterepair: 0xcaca,
    // factorymode: 0xcb,
    custom: 0x09,
  },
  v1: {
    classic: 0x01,
    extreme: 0x02,
    elevated: 0x03,
  },
  xr: {
    sequoia: 0x04,
    cruz: 0x05,
    mission: 0x06,
    delirium: 0x08,
  },
  pint: {
    redwood: 0x05,
    pacific: 0x06,
    elevated: 0x07,
    skyline: 0x08,
  },
};

interface Props {
  device?: PeripheralInfo;
}

interface State {
  setMode?: number;
}

class ModeSelection extends Component<Props, State> {
  boardType: number = BoardGeneration.Pint;

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
      ).then((hwRevision: number[]) => {
        console.debug(`Retreived board hardware revision: ${hwRevision}`);
        this.boardType = inferBoardFromHardwareRevision(hwRevision);
      });
      BTManager.read(
        this.props.device.id,
        ONEWHEEL_SERVICE_UUID,
        CHARACTERISTICS.rideMode,
      ).then(rMode => {
        const bMode = Buffer.from(rMode);
        const currentMode = bMode.readUInt8(1);
        console.debug(`Current ride mode: ${currentMode}`);
        this.state = {
          setMode: currentMode,
        };
      });
    }
  }

  async select(selection: string): Promise<void> {
    const modeValue = modes.pint[selection];
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
      modeValue,
    ).catch(err => {
      console.error(err);
    });
    this.setState({setMode: modeValue});
  }

  render(): JSX.Element {
    // Render mode selection based on OW generation.
    return (
      <View>
        <Button
          title="🌳 Redwood "
          disabled={this.state?.setMode === modes.pint.redwood}
          onPress={() => {
            this.select('redwood');
          }}
        />
        <Button
          title="🌊 Pacific"
          disabled={this.state?.setMode === modes.pint.pacific}
          onPress={() => {
            this.select('pacific');
          }}
        />
        <Button
          title="⛰️ Elevated"
          disabled={this.state?.setMode === modes.pint.elevated}
          onPress={() => {
            this.select('elevated');
          }}
        />
        <Button
          title="🏙️ Skyline"
          disabled={this.state?.setMode === modes.pint.skyline}
          onPress={() => {
            this.select('skyline');
          }}
        />
        <Button
          title="🧰 Custom Shaping"
          disabled={this.state?.setMode === 9}
        />
      </View>
    );
  }
}

export default ModeSelection;

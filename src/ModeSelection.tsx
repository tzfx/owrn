import React, {Component} from 'react';

import {Buffer} from '@craftzdog/react-native-buffer';
import {Button, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './rewheel/ble';
import {inferBoardFromHardwareRevision} from './rewheel/board';

type SupportedBoards = 'XR' | 'Pint';

const modes: {
  [board in SupportedBoards]: {
    [mode: string]: {symbol: string; value: number};
  };
} = {
  XR: {
    sequoia: {symbol: '🌳', value: 0x04},
    cruz: {symbol: '🚢', value: 0x05},
    mission: {symbol: '🛕', value: 0x06},
    delirium: {symbol: '😵‍💫', value: 0x08},
    custom: {symbol: '🧰', value: 0x09},
  },
  Pint: {
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
  boardType: SupportedBoards;
  setMode?: number;
}

class ModeSelection extends Component<Props, State> {
  state: Readonly<State> = {
    boardType: 'Pint',
  };
  componentDidMount(): void {
    if (this.props.device != null) {
      Promise.all([
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.hardwareRevision,
        ).then((rhwr: number[]) => {
          const bhwr = Buffer.from(rhwr);
          const hwRevision = bhwr.readUInt16BE(0);
          const boardType = inferBoardFromHardwareRevision(
            hwRevision,
          ) as SupportedBoards;
          // type guard.
          if (['XR', 'Pint'].every(t => t !== boardType)) {
            throw new Error(`Unsupported board type found:  ${boardType}`);
          }
          console.debug(
            `Retrieved board hardware revision: ${hwRevision} (${boardType})`,
          );
          return boardType;
        }),
        BTManager.read(
          this.props.device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.rideMode,
        ).then(rMode => {
          const bMode = Buffer.from(rMode);
          const currentMode = bMode.readUInt8(1);
          console.debug(`Current ride mode: ${currentMode}`);
          return currentMode;
        }),
      ])
        .then(([boardType, setMode]) => {
          this.setState({
            boardType,
            setMode,
          });
        })
        .catch(err => {
          console.error(err);
        });
    }
  }

  /**
   * Isses a bluetooth update to change the board to a given mode.
   * See the `modes` const for different options per board.
   * @param selection mode name to switch to
   */
  async select(selection: string): Promise<void> {
    if (this.state.boardType == null) {
      throw new Error('Could not determine board type.');
    }
    const modeValue = modes[this.state.boardType][selection].value;
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
        {Object.entries(modes[this.state.boardType]).map(
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

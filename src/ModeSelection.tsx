import React, {useEffect, useState} from 'react';

import {Buffer} from '@craftzdog/react-native-buffer';
import {Button, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './util/Bluetooth';
import {inferBoardFromHardwareRevision} from './util/board';

type SupportedBoards = 'XR' | 'Pint';

const modes: {
  [board in SupportedBoards]: {
    [modeName: string]: {symbol: string; value: number};
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

const ModeSelection = ({device}: Props) => {
  const [mode, setMode] = useState<Number | null>(null);
  const [boardType, setBoardType] = useState<SupportedBoards>('Pint');

  /**
   * Isses a bluetooth update to change the board to a given mode.
   * See the `modes` const for different options per board.
   * @param selection mode name to switch to
   */
  async function select(selection: string): Promise<void> {
    if (boardType == null) {
      throw new Error('Could not determine board type.');
    }
    const modeValue = modes[boardType][selection].value;
    if (modeValue == null) {
      throw new Error(`Unable to retrieve value for mode ${selection}`);
    }
    if (device == null) {
      throw new Error('No connected device. (ModeSelection)');
    }

    await BTManager.write(
      device.id,
      ONEWHEEL_SERVICE_UUID,
      CHARACTERISTICS.rideMode,
      [modeValue],
    )
      .then(() => setMode(mode))
      .catch(err => {
        console.error('Unable to set new ridemode:', err);
      });
  }

  useEffect(() => {
    const getBoardInfo = async () => {
      if (device?.id == null) {
        throw new Error('No connected device. (getBoardInfo)');
      }
      return Promise.all([
        BTManager.read(
          device?.id,
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
          device?.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.rideMode,
        ).then(rMode => {
          const bMode = Buffer.from(rMode);
          const currentMode = bMode.readUInt8(1);
          console.debug(`Current ride mode: ${currentMode}`);
          return currentMode;
        }),
      ]);
    };

    getBoardInfo()
      .then(([readBoardType, readMode]) => {
        setBoardType(readBoardType);
        setMode(readMode);
      })
      .catch(err => console.error(err));
  }, [device]);

  function wrapIfSelected(title: string, modeOption: number) {
    if (mode === modeOption) {
      return `>>> ${title} <<<`;
    }
    return title;
  }

  // Render mode selection based on OW generation.
  return (
    <View>
      {Object.entries(modes[boardType]).map(([modeName, {symbol, value}]) => (
        <Button
          title={wrapIfSelected(
            `${symbol} ${modeName[0].toUpperCase() + modeName.slice(1)}`,
            value,
          )}
          key={modeName}
          disabled={mode === value}
          onPress={() => select(modeName).catch(err => console.error(err))}
        />
      ))}
    </View>
  );
};

export default ModeSelection;

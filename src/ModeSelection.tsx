import React, {useEffect, useState} from 'react';

import {Buffer} from '@craftzdog/react-native-buffer';
import {Pressable, Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import CustomShaping from './CustomShaping';
import {Typography} from './Typography';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './util/bluetooth';
import {SavedBoard} from './StorageService';

type SupportedBoards = 'GT' | 'Pint' | 'PintX' | 'XR';

const modes: {
  [board in SupportedBoards]: {
    [modeName: string]: {symbol: string; value: number};
  };
} = {
  GT: {
    roam: {symbol: '🌳', value: 0x04},
    flow: {symbol: '🌊', value: 0x05},
    highline: {symbol: '🚠', value: 0x06},
    elevated: {symbol: '⛰️', value: 0x07},
    apex: {symbol: '📈', value: 0x08},
    custom: {symbol: '🧰', value: 0x09},
  },
  Pint: {
    redwood: {symbol: '🌳', value: 0x05},
    pacific: {symbol: '🌊', value: 0x06},
    elevated: {symbol: '⛰️', value: 0x07},
    skyline: {symbol: '🏙️', value: 0x08},
    custom: {symbol: '🧰', value: 0x09},
  },
  PintX: {
    redwood_x: {symbol: '🌳', value: 0x05},
    pacific_x: {symbol: '🌊', value: 0x06},
    elevated_x: {symbol: '⛰️', value: 0x07},
    skyline_x: {symbol: '🏙️', value: 0x08},
    custom_x: {symbol: '🧰', value: 0x09},
  },
  XR: {
    sequoia: {symbol: '🌳', value: 0x04},
    cruz: {symbol: '🚢', value: 0x05},
    mission: {symbol: '🛕', value: 0x06},
    delirium: {symbol: '😵‍💫', value: 0x08},
    custom: {symbol: '🧰', value: 0x09},
  },
};

interface Props {
  device?: PeripheralInfo;
  board?: SavedBoard;
  debug?: boolean;
}

const ModeSelection = ({device, board, debug}: Props) => {
  const [mode, setMode] = useState<Number | null>(null);
  const [isShapingOpen, setIsShapingOpen] = useState(false);

  const boardType = board?.generation === 5 ? 'Pint' : 'XR';
  console.debug('gen ->', board?.generation);

  /**
   * Isses a bluetooth update to change the board to a given mode.
   * See the `modes` const for different options per board.
   * @param selection mode name to switch to
   */
  async function select(selection: string): Promise<void> {
    if (board == null) {
      throw new Error('Could not determine board type.');
    }
    const modeValue = modes[boardType][selection].value;
    if (modeValue == null) {
      throw new Error(`Unable to retrieve value for mode ${selection}`);
    }
    if (device == null) {
      throw new Error('No connected device. (ModeSelection)');
    }
    try {
      await BTManager.write(
        device.id,
        ONEWHEEL_SERVICE_UUID,
        CHARACTERISTICS.rideMode,
        [modeValue],
      );
      setMode(modeValue);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (debug) {
      setMode(9);
    }

    const getBoardInfo = async () => {
      if (device?.id == null) {
        throw new Error('No connected device. (getBoardInfo)');
      }
      const rMode = await BTManager.read(
        device?.id,
        ONEWHEEL_SERVICE_UUID,
        CHARACTERISTICS.rideMode,
      );
      const bMode = Buffer.from(rMode);
      const currentMode = bMode.readUInt8(1);
      console.debug(`Current ride mode: ${currentMode}`);
      return currentMode;
    };

    getBoardInfo()
      .then(readMode => {
        setMode(readMode);
      })
      .catch(err => console.error(err));
  }, [device, debug]);

  function wrapIfSelected(title: string, modeOption: number) {
    if (mode === modeOption) {
      return `>>> ${title} <<<`;
    }
    return title;
  }

  // Render mode selection based on OW generation.
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {Object.entries(modes[boardType])
          .filter(([modeName]) =>
            isShapingOpen ? modeName === 'custom' : true,
          )
          .map(([modeName, {symbol, value}]) => (
            <Pressable
              key={modeName}
              disabled={mode === value}
              onPress={() => select(modeName).catch(err => console.error(err))}>
              <Text
                style={{
                  fontSize: Typography.fontsize.medium,
                  color: mode === value ? 'grey' : Typography.colors.emerald,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  textAlign: 'center',
                }}>
                {wrapIfSelected(
                  `${symbol} ${modeName[0].toUpperCase() + modeName.slice(1)}`,
                  value,
                )}
              </Text>
            </Pressable>
          ))}
      </View>
      {isShapingOpen && <CustomShaping device={device} />}
      {mode === 9 && (
        <Pressable
          style={{
            marginTop: 10,
            backgroundColor: Typography.colors.emerald,
            paddingVertical: 10,
          }}
          onPress={() => setIsShapingOpen(!isShapingOpen)}>
          <Text
            style={{
              fontSize: Typography.fontsize.small,
              color: Typography.colors.white,
              textAlign: 'center',
            }}>
            {isShapingOpen ? 'Close Shaping' : 'Open Shaping'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default ModeSelection;

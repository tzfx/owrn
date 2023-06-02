import React, {useEffect, useState} from 'react';

import {Buffer} from '@craftzdog/react-native-buffer';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import CustomShaping from './CustomShaping';
import {Typography} from './Typography';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './util/bluetooth';
import {AppConfig, SavedBoard} from './StorageService';
import {Generation2Name, SupportedGenerationName} from './util/board';

const modes: {
  [board in SupportedGenerationName]: {
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
    redwood: {symbol: '🌳', value: 0x05},
    pacific: {symbol: '🌊', value: 0x06},
    elevated: {symbol: '⛰️', value: 0x07},
    skyline: {symbol: '🏙️', value: 0x08},
    custom: {symbol: '🧰', value: 0x09},
  },
  XR: {
    sequoia: {symbol: '🌳', value: 0x04},
    cruz: {symbol: '🚢', value: 0x05},
    mission: {symbol: '🛕', value: 0x06},
    elevated: {symbol: '⛰️', value: 0x07},
    delirium: {symbol: '😵‍💫', value: 0x08},
    custom: {symbol: '🧰', value: 0x09},
  },
};

interface Props {
  device?: PeripheralInfo;
  board?: SavedBoard;
  config?: AppConfig;
}

const ModeSelection = ({device, board, config}: Props) => {
  const [mode, setMode] = useState<Number | null>(null);
  const [isShapingOpen, setIsShapingOpen] = useState(false);

  const boardType: SupportedGenerationName =
    Generation2Name[board?.generation ?? 5];

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
      throw new Error(
        `Unable to set ride mode: ${mode} -> ${selection}\n${err}`,
      );
    }
  }

  useEffect(() => {
    if (config?.debug) {
      setMode(0x09);
    }

    const getBoardInfo = async () => {
      if (device?.id == null) {
        return Promise.reject('No connected device. (getBoardInfo)');
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
  }, [device, config]);

  function wrapIfSelected(title: string, modeOption: number) {
    if (mode === modeOption) {
      return `[ ${title} ]`;
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
          alignItems: 'stretch',
        }}>
        {Object.entries(modes[boardType])
          .filter(([modeName]) => {
            if (modeName === 'custom') {
              if (!board?.canUseCustomShaping) {
                return false;
              }
              return true;
            } else {
              if (isShapingOpen) {
                return false;
              }
            }
            return true;
          })
          .map(([modeName, {symbol, value}]) => (
            <Pressable
              style={{
                flexBasis: '50%',
                height: 50,
                borderColor:
                  mode !== value
                    ? Typography.colors.emerald
                    : Typography.colors.white,
                backgroundColor:
                  mode === value
                    ? Typography.colors.emerald
                    : Typography.colors.white,
                borderWidth: StyleSheet.hairlineWidth,
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1,
              }}
              key={modeName}
              disabled={mode === value}
              onPress={() => select(modeName).catch(err => console.error(err))}>
              <Text
                style={{
                  fontSize: Typography.fontsize.medium,
                  color:
                    mode === value
                      ? Typography.colors.white
                      : Typography.colors.emerald,
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
            marginTop: 5,
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
            // marginTop: 10,
            backgroundColor: Typography.colors.emerald,
            // paddingVertical: 10,
          }}
          onPress={() => setIsShapingOpen(!isShapingOpen)}>
          <Text
            style={{
              fontSize: Typography.fontsize.medium,
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

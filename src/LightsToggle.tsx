import React, {useEffect, useLayoutEffect, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './util/bluetooth';
import {Buffer} from '@craftzdog/react-native-buffer';
import {Typography} from './Typography';
import {rescale} from './util/utils';
import {SavedBoard} from './StorageService';
import {BoardGeneration} from './util/board';

type Props = {
  board?: SavedBoard;
  device?: PeripheralInfo;
};

const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕'];

const LightsToggle = ({board, device}: Props) => {
  const [lights, setLights] = useState(true);

  const [brightness, setBrightness] = useState(5);
  const [showBrightnessControl, setShowBrightnessControl] = useState(
    board?.generation === BoardGeneration.GT,
  );

  async function toggleLights() {
    if (device?.id != null) {
      await BTManager.write(
        device.id,
        ONEWHEEL_SERVICE_UUID,
        CHARACTERISTICS.lights,
        [lights ? 0 : 1],
      );
      setLights(!lights);
      setShowBrightnessControl(false);
    }
  }

  // @TODO: Brightness does not appear to work at all on pint? Investigate more, disabled for now.
  async function adjustBrightness(direction: 1 | -1) {
    if (device?.id != null) {
      const out = Math.round(rescale(brightness + direction, 1, 5, 0, 255));
      console.debug('writing brightness', out);
      await BTManager.write(
        device?.id,
        ONEWHEEL_SERVICE_UUID,
        CHARACTERISTICS.lights,
        [out, 1],
      );
      const rlights = await BTManager.read(
        device.id,
        ONEWHEEL_SERVICE_UUID,
        CHARACTERISTICS.lights,
      );
      const bLights = Buffer.from(rlights);
      const [brightnessValue, _enabledValue] = [
        bLights.readUInt8(0),
        bLights.readUInt8(1),
      ];
      console.debug('bright', brightnessValue);
      setBrightness(brightness + direction);
    }
  }

  useLayoutEffect(() => {
    if (board != null) {
      setShowBrightnessControl(board.generation === BoardGeneration.GT);
    }
  }, [board]);

  useEffect(() => {
    async function readLights() {
      if (device?.id != null) {
        const rlights = await BTManager.read(
          device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.lights,
        );
        const bLights = Buffer.from(rlights);
        const [brightnessValue, enabledValue] = [
          bLights.readUInt8(0),
          bLights.readUInt8(1),
        ];
        console.debug('enabled, bright', enabledValue, brightnessValue);
        setLights(!!enabledValue);
        setBrightness(brightnessValue + 1);
      }
    }
    readLights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Meant to be fired off only once on init.

  return (
    <View
      style={{
        flexDirection: 'row',
      }}>
      <Pressable
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: Typography.fontsize.large * 1.5,
          width: Typography.fontsize.large * 1.5,
          backgroundColor: lights
            ? Typography.colors.emerald
            : Typography.colors.davys_grey,
          borderRadius: 15,
          marginHorizontal: 5,
        }}
        onPress={() => toggleLights()}>
        <Text style={{fontSize: Typography.fontsize.large}}>
          {lights ? '🌕' : '🌑'}
        </Text>
      </Pressable>
      {showBrightnessControl && (
        <View>
          <Pressable
            disabled={brightness === MOON_PHASES.length}
            onPress={() => adjustBrightness(1)}
            style={({pressed}) => ({
              justifyContent: 'center',
              alignItems: 'center',
              height: Typography.fontsize.large * 0.75,
              width: Typography.fontsize.large * 0.75,
              backgroundColor: pressed
                ? Typography.colors.davys_grey
                : Typography.colors.celadon,
              borderRadius: 10,
              opacity: brightness === MOON_PHASES.length ? 0.25 : 1,
            })}>
            <Text style={{fontSize: Typography.fontsize.medium}}>+</Text>
          </Pressable>
          <Pressable
            onPress={() => adjustBrightness(-1)}
            disabled={brightness === 1}
            style={({pressed}) => ({
              justifyContent: 'center',
              alignItems: 'center',
              height: Typography.fontsize.large * 0.75,
              width: Typography.fontsize.large * 0.75,
              backgroundColor: pressed
                ? Typography.colors.davys_grey
                : Typography.colors.celadon,
              borderRadius: 10,
              opacity: brightness === 1 ? 0.25 : 1,
            })}>
            <Text style={{fontSize: Typography.fontsize.medium}}>-</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default LightsToggle;

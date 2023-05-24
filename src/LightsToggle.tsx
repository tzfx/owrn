import React, {useEffect, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './util/bluetooth';
import {Buffer} from '@craftzdog/react-native-buffer';
import {Typography} from './Typography';

type Props = {
  device?: PeripheralInfo;
};

// @TODO: Brightness selection.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕'];

const LightsToggle = ({device}: Props) => {
  const [lights, setLights] = useState(true);

  // @TODO: Brightness selection.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [brightness, setBrightness] = useState(0);

  async function toggleLights() {
    if (device?.id != null) {
      await BTManager.write(
        device.id,
        ONEWHEEL_SERVICE_UUID,
        CHARACTERISTICS.lights,
        [lights ? 0 : 1],
      );
      setLights(!lights);
    }
  }

  useEffect(() => {
    async function readLights() {
      if (device?.id != null) {
        const rlights = await BTManager.read(
          device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.lights,
        );
        const bLights = Buffer.from(rlights);
        const [enabledValue, brightnessValue] = [
          bLights.readUInt8(0),
          bLights.readUInt8(1),
        ];
        setLights(!!enabledValue);
        setBrightness(brightnessValue);
      }
    }
    readLights();
  }, [device]);

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        paddingRight: '10%',
        position: 'absolute',
      }}>
      <Pressable
        style={({pressed}) => ({
          justifyContent: 'center',
          alignItems: 'center',
          height: 50,
          width: 50,
          backgroundColor: pressed
            ? Typography.colors.davys_grey
            : Typography.colors.emerald,
          borderRadius: 15,
        })}
        onPress={() => toggleLights()}>
        <Text style={{fontSize: Typography.fontsize.large}}>
          {lights ? '🌝' : '🌚'}
        </Text>
      </Pressable>
    </View>
  );
};

export default LightsToggle;

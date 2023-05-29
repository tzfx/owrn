import React, {useEffect, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {
  CHARACTERISTICS,
  ONEWHEEL_SERVICE_UUID,
  RIDE_TRAIT_VALUES,
} from './util/bluetooth';
import {Buffer} from '@craftzdog/react-native-buffer';
import {Typography} from './Typography';
import {SavedBoard} from './StorageService';

type Props = {
  board?: SavedBoard;
  device?: PeripheralInfo;
};

const SimpleStopToggle = ({board, device}: Props) => {
  const [simpleStop, setSimpleStop] = useState(true);

  async function toggleSimpleStop() {
    if (device?.id != null) {
      await BTManager.write(
        device.id,
        ONEWHEEL_SERVICE_UUID,
        CHARACTERISTICS.rideTrait,
        [RIDE_TRAIT_VALUES.simpleStop, !simpleStop ? 1 : 0],
      );
      setSimpleStop(!simpleStop);
    }
  }

  useEffect(() => {
    async function readSimpleStop() {
      if (device?.id != null) {
        const rlights = await BTManager.read(
          device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.rideTrait,
        );
        const bLights = Buffer.from(rlights);
        const [trait, value] = [bLights.readUInt8(0), bLights.readUInt8(1)];
        console.debug('trait, val', trait, value);
        setSimpleStop(!!value);
      }
    }
    readSimpleStop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Meant to be fired off only once on init.

  // XR can't SimpleStop :(
  return (board?.generation ?? 0) > 4 ? (
    <Pressable
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        height: Typography.fontsize.large * 1.5,
        width: Typography.fontsize.large * 1.5,
        backgroundColor: simpleStop
          ? Typography.colors.emerald
          : Typography.colors.davys_grey,
        borderRadius: 15,
        marginHorizontal: 5,
      }}
      onPress={() => toggleSimpleStop()}>
      <Text style={{fontSize: Typography.fontsize.large}}>
        {simpleStop ? '✋' : '🤘'}
      </Text>
    </Pressable>
  ) : (
    <View />
  );
};

export default SimpleStopToggle;

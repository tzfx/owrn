import {Buffer} from '@craftzdog/react-native-buffer';
import React, {useEffect, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {SavedBoard} from './StorageService';
import {Typography} from './Typography';
import {
  CHARACTERISTICS,
  ONEWHEEL_SERVICE_UUID,
  RIDE_TRAIT_VALUES,
} from './util/bluetooth';

type Props = {
  board?: SavedBoard;
  device?: PeripheralInfo;
};

const SimpleStopToggle = ({board, device}: Props) => {
  const [simpleStop, setSimpleStop] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function toggleSimpleStop() {
    if (device?.id != null) {
      try {
        await BTManager.write(
          device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.rideTrait,
          [RIDE_TRAIT_VALUES.simpleStop, !simpleStop ? 1 : 0],
        );
        await readSimpleStop();
      } catch (err) {
        return Promise.reject('Unable to write simpleStop value.');
      }
    }
  }

  async function readSimpleStop() {
    if (device?.id != null) {
      try {
        let count = 0;
        // this looping situation is pretty awful.
        while (count < 5) {
          const rtrait = await BTManager.read(
            device.id,
            ONEWHEEL_SERVICE_UUID,
            CHARACTERISTICS.rideTrait,
          );
          const btrait = Buffer.from(rtrait);
          const [trait, value] = [btrait.readUInt8(0), btrait.readUInt8(1)];
          if (trait === RIDE_TRAIT_VALUES.simpleStop) {
            count++;
            if (count > 2) {
              setSimpleStop(!!value);
              setUpdating(false);
              return;
            }
          }
        }
      } catch (err) {
        return Promise.reject('Unable to read simpleStop value');
      }
    }
  }

  useEffect(() => {
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
        opacity: updating ? 0.5 : 1,
      }}
      disabled={updating}
      onPress={async () => {
        setUpdating(true);
        await toggleSimpleStop();
        setUpdating(false);
      }}>
      <Text style={{fontSize: Typography.fontsize.large}}>
        {simpleStop ? '✋' : '🤘'}
      </Text>
    </Pressable>
  ) : (
    <View />
  );
};

export default SimpleStopToggle;

import React, {useEffect, useState} from 'react';
import {NativeEventEmitter, NativeModules, View} from 'react-native';
import ShapingToggle from './ShapingToggle';
import {
  CHARACTERISTICS,
  ONEWHEEL_SERVICE_UUID,
  RIDE_TRAIT_VALUES,
} from './util/bluetooth';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

import {Buffer} from '@craftzdog/react-native-buffer';
import {rescale} from './util/utils';

export const SHAPING_LIMITS = {
  min: 0,
  max: 10,
};

export type ShapingOptionName = 'fire' | 'flow' | 'tilt';

const shapingOptions: {
  name: ShapingOptionName;
  colors: {up: string; down: string};
  limits: {
    min: number;
    max: number;
    step: number;
  };
}[] = [
  {
    name: 'fire',
    colors: {up: '#e45221', down: '#8e452c'},
    limits: {
      min: 0,
      max: 10,
      step: 1,
    },
  },
  {
    name: 'flow',
    colors: {up: '#9DC6E1', down: '#6a8596'},
    limits: {
      min: 0,
      max: 10,
      step: 1,
    },
  },
  {
    name: 'tilt',
    colors: {up: '#000', down: 'grey'},
    limits: {
      min: -1.5,
      max: 3,
      step: 0.1,
    },
  },
];

type Props = {
  device?: PeripheralInfo;
};

const CustomShaping = ({device}: Props) => {
  const [fire, setFire] = useState(0);
  const [flow, setFlow] = useState(0);
  const [tilt, setTilt] = useState(0.0);

  // init
  useEffect(() => {
    async function getTraitData() {
      if (device != null) {
        await BTManager.startNotification(
          device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.rideTrait,
        );
        return bleManagerEmitter.addListener(
          'BleManagerDidUpdateValueForCharacteristic',
          ({value, characteristic}) => {
            if (characteristic === CHARACTERISTICS.rideTrait) {
              const bTrait = Buffer.from(value);
              const [trait, traitValue] = [
                bTrait.readInt8(0),
                bTrait.readInt8(1),
              ];
              switch (trait) {
                case RIDE_TRAIT_VALUES.aggressiveness:
                  setFire(Math.round(rescale(traitValue, -80, 127, 0, 10)));
                  break;
                case RIDE_TRAIT_VALUES.turnCompensation:
                  setFlow(Math.round(rescale(traitValue, -100, 100, 0, 10)));
                  break;
                case RIDE_TRAIT_VALUES.angleOffset:
                  setTilt(traitValue);
                  break;
                default:
                  console.error(
                    `Found invalid trait pair: ${[trait, traitValue].join(
                      ':',
                    )}`,
                  );
              }
            }
          },
        );
      }
    }
    getTraitData();
    // TODO: ^ Remove this explicit subscriber when destroyed.
    return () =>
      bleManagerEmitter.removeAllListeners(
        'BleManagerDidUpdateValueForCharacteristic',
      );
  }, [device]);

  async function handleModifier(option: ShapingOptionName, modifier: number) {
    if (device != null) {
      switch (option) {
        case 'fire':
          await BTManager.write(
            device.id,
            ONEWHEEL_SERVICE_UUID,
            CHARACTERISTICS.rideTrait,
            [
              RIDE_TRAIT_VALUES.aggressiveness,
              Math.round(rescale(fire + modifier, 0, 10, -80, 127)),
            ],
          );
          setFire(fire + modifier);
          break;
        case 'flow':
          await BTManager.write(
            device.id,
            ONEWHEEL_SERVICE_UUID,
            CHARACTERISTICS.rideTrait,
            [
              RIDE_TRAIT_VALUES.turnCompensation,
              Math.round(rescale(flow + modifier, 0, 10, -100, 100)),
            ],
          );
          setFlow(flow + modifier);
          break;
        case 'tilt':
          await BTManager.write(
            device.id,
            ONEWHEEL_SERVICE_UUID,
            CHARACTERISTICS.rideTrait,
            [
              RIDE_TRAIT_VALUES.angleOffset,
              Math.round(tilt + modifier / -0.05),
            ],
          );
          setTilt(tilt + modifier);
          break;
      }
    }
  }

  return (
    <View style={{flexDirection: 'row', width: '100%'}}>
      {shapingOptions.map(option => {
        return (
          <ShapingToggle
            key={option.name}
            value={
              option.name === 'fire'
                ? fire
                : option.name === 'flow'
                ? flow
                : tilt
            }
            handleModifier={handleModifier}
            option={option}
          />
        );
      })}
    </View>
  );
};

export default CustomShaping;

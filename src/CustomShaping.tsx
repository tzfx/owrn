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

export type ShapingOptionName = 'fire' | 'flow' | 'tilt';

export type ShapingOption = {
  name: ShapingOptionName;
  emoji: string;
  colors: {up: string; down: string; label: string};
  limits: {
    min: number;
    max: number;
    step: number;
  };
};

const shapingOptions: ShapingOption[] = [
  {
    name: 'fire',
    emoji: '🔥',
    colors: {up: '#e45221', down: '#8e452c', label: '#E2B1A1'},
    limits: {
      min: 0,
      max: 10,
      step: 1,
    },
  },
  {
    name: 'flow',
    emoji: '🌊',
    colors: {up: '#9DC6E1', down: '#6a8596', label: '#E0EDF5'},
    limits: {
      min: 0,
      max: 10,
      step: 1,
    },
  },
  {
    name: 'tilt',
    emoji: '⚖️',
    colors: {up: '#000', down: 'grey', label: '#DFE1E2'},
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
              console.debug(`Read Trait !! ${trait}: ${traitValue}`);
              switch (trait) {
                case RIDE_TRAIT_VALUES.angleOffset: // 0
                  setTilt(+(traitValue / -20).toFixed(1));
                  break;
                case RIDE_TRAIT_VALUES.turnCompensation: // 1
                  setFlow(Math.round(rescale(traitValue, -100, 100, 0, 10)));
                  break;
                case RIDE_TRAIT_VALUES.aggressiveness: // 2
                  setFire(Math.round(rescale(traitValue, -80, 127, 0, 10)));
                  break;
                case RIDE_TRAIT_VALUES.simpleStop: // 3
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
        case 'tilt':
          await BTManager.write(
            device.id,
            ONEWHEEL_SERVICE_UUID,
            CHARACTERISTICS.rideTrait,
            [
              RIDE_TRAIT_VALUES.angleOffset,
              Math.round(-20 * (tilt + modifier)),
            ],
          );
          break;
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
              option.name === 'tilt'
                ? tilt
                : option.name === 'fire'
                ? fire
                : flow
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

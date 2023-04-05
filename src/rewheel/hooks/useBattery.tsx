import {BoardGeneration, inferBoardFromHardwareRevision} from '../common';
import {useBLECharacteristic} from './useBLECharacteristic';
import {useHardwareRevision} from './useOnewheelInfo';

export const useBatteryVoltage = () => {
  const {batteryVoltage} = useBLECharacteristic('batteryVoltage', {
    read: true,
    notify: true,
  });
  return batteryVoltage?.getInt16(0) / 10;
};

export const useBatteryPercentage = () => {
  const {batteryPercent} = useBLECharacteristic('batteryPercent', {
    read: true,
    notify: true,
  });

  return batteryPercent?.getUint8(1);
};

export const useBatteryTemperature = () => {
  const hardwareRevision = useHardwareRevision();
  const {batteryTemperature} = useBLECharacteristic('batteryTemperature', {
    read: true,
    notify: true,
  });

  const boardGeneration = inferBoardFromHardwareRevision(hardwareRevision);

  return batteryTemperature?.getUint8(
    boardGeneration <= BoardGeneration.Plus ? 1 : 0,
  );
};

export const useBatterySerialNumber = () => {
  const {batterySerialNumber} = useBLECharacteristic('batterySerialNumber', {
    read: true,
  });

  return batterySerialNumber?.getUint16(0);
};

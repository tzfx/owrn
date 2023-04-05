import { useBLECharacteristic } from "./useBLECharacteristic"

export const useHardwareRevision = () => {
  const { hardwareRevision } = useBLECharacteristic("hardwareRevision", {
    read: true,
  })
  return hardwareRevision?.getUint16(0)
}

export const useFirmwareRevision = () => {
  const { firmwareRevision } = useBLECharacteristic("firmwareRevision", {
    read: true,
  })
  return firmwareRevision?.getUint16(0)
}

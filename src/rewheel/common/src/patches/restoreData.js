import { allGenerations, getRevisionInformation } from "../../../board.js"
import { printArgs } from "../utils/helpers.js"

/*
  divide number % 0x10000 (65536) = scalar => store at 0x0800fc30
  subtract 0x10000 * scalar from serial number
  store remainder at uint16 in LE format at 0x0800fc0a

  note: this only works on older firmware. newer firmware has a different settings layout
*/
export const restoreSerialNumber = (serialNumber) => {
  if (!serialNumber) return []

  if (typeof serialNumber !== "string" || serialNumber.length === 0)
    throw "invalidSerialNumberFormat"

  const normalized = serialNumber.replace("OW", "")
  if (normalized.length !== 6)
    throw "invalidSerialNumber"

  const asNumber = parseInt(normalized)
  if (isNaN(asNumber))
    throw "invalidSerialNumber"

  printArgs({ serialNumber: asNumber })

  const scalar = Math.floor(asNumber / 0x10000)
  const remainder = asNumber % (0x10000 * scalar)
  const buffer = new Uint8Array(2)
  const view = new DataView(buffer.buffer, 0, 2)
  view.setUint16(0, remainder, true)

  return [
    {
      start: (firmwareRevision) => {
        const { major, minor, patch } = getRevisionInformation(firmwareRevision)

        if (patch >= 55 && (major === 4 && minor === 1) || (major >= 5))
          throw "newerFirmwareError"

        return 0xfc30
      },
      data: [scalar],
    },
    {
      start: (firmwareRevision) => {
        const { major, minor, patch } = getRevisionInformation(firmwareRevision)

        if (patch >= 55 && (major === 4 && minor === 1) || (major >= 5))
          throw "newerFirmwareError"

        return 0xfc0a
      },
      data: Array.from(buffer),
    },
  ]
}

/*
  (not the complete mileage solution but practically correct up to 2,372,910 miles)
  multiple mileage by 0x712
  store at 0x0800fc0c as uint32 in LE
*/
export const restoreMileage = (mileage) => {
  if (!mileage) return []

  mileage = parseInt(mileage)

  if (typeof mileage !== "number" || isNaN(mileage))
    throw "invalidMileage"

  const buffer = new Uint8Array(4)
  const view = new DataView(buffer.buffer, 0, 4)
  view.setUint32(0, mileage * 0x712, true)

  printArgs({ mileage })

  return [
    {
      start: {
        start: (firmwareRevision) => {
          const { major, minor, patch } = getRevisionInformation(firmwareRevision)

          if (patch >= 55 && (major === 4 && minor === 1) || (major >= 5))
            throw "newerFirmwareError"

          return 0xfc0c
        },
      },
      data: Array.from(buffer),
    },
  ]
}

export const restoreData = {
  priority: 0,
  supported: allGenerations,
  args: {
    serialNumber: {
      required: false,
    },
    mileage: {
      required: false,
    },
  },
  modifications: ({ serialNumber, mileage }) => [
    ...restoreSerialNumber(serialNumber),
    ...restoreMileage(mileage),
  ],
}

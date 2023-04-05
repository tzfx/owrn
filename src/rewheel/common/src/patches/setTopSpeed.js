import { allGenerations } from "../../../board"

export const setTopSpeed = {
  priority: 1,
  description: `Sets the top speed before pushback`,
  supported: allGenerations,
  args: {
    topSpeed: {
      required: true,
      type: 'number',
      min: 900,
      max: 2000
    },
  },
  experimental: true,
  confirm: true,
  modifications: ({ topSpeed, firmwareRevision }) => {
    topSpeed = parseInt(topSpeed)
    if (isNaN(topSpeed))
      throw "notANumber"

    if (topSpeed < 900 || topSpeed > 2000)
      throw "outOfRange"
    const buffer = new Uint8Array(2)
    const buffer2 = new Uint8Array(2)
    const view = new DataView(buffer.buffer)
    const view2 = new DataView(buffer2.buffer)
    view.setUint16(0, topSpeed, true)

    const register = firmwareRevision === 5076 ? 0x0a : 6
    view.setUint8(1, (view.getUint8(1) << 4) + register)

    view2.setUint16(0, topSpeed, true)
    view2.setUint8(1, view.getUint8(1) << 4)

    return [
      {
        start: {
          5040: 0xa8c4,
          5076: 0xa0d8
        },
        data: Array.from(buffer),
      },
      {
        start: {
          5040: 0xa8c8,
          5076: 0xa0dc
        },
        data: Array.from(buffer),
      },
      {
        start: {
          5040: 0xaa1e,
          5076: 0xa21a
        },
        data: Array.from(buffer2),
      },
      {
        start: {
          5040: 0xaa22,
          5076: 0xa21e
        },
        data: Array.from(buffer2),
      },
    ]
  },
}

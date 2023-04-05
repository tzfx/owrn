import { allGenerations } from "../../../board.js"
import { printArgs } from "../utils/helpers.js"

export const setAngleOffset = {
  priority: 0,
  supported: allGenerations,
  args: {
    angleOffset: {
      required: true,
    },
  },
  modifications: ({ angleOffset, revision }) => {
    angleOffset = parseInt(angleOffset)

    if (isNaN(angleOffset)) throw "notANumber"

    if (angleOffset < 0 && revision > 4144)
      throw "negativeValueNewerFirmware"
    else if (angleOffset > 10 || angleOffset < -10)
      throw "outOfRange"

    const buffer = new Uint8Array(2)
    const view = new DataView(buffer.buffer, 0, 2)

    // the way this value is set changed from exact angle to angle offset. Known at least to be different on 4144
    const valueToSet = revision <= 4144 ? 36000 + (angleOffset * 100) : angleOffset * 100
    view.setInt16(0, valueToSet.toFixed(0), revision <= 4144)

    printArgs({ angleOffset })

    return [
      {
        start: (_revision) => {
          return 0xfc00
        },
        data: Array.from(buffer),
      },
    ]
  },
}

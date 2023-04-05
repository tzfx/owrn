import { allGenerations } from "../../../board.js"
import { padNops } from "../utils/helpers.js"

export const removeBleHandshakeCheck = {
  priority: 0,
  supported: allGenerations,
  modifications: [
    {
      start: {
        4144: 0x9aa6,
        5040: 0x9a9a,
        5046: 0x9aca,
        5050: 0x9c02,
      },
      data: padNops([0x01, 0x20, 0x60, 0x74], 2),
    },
    // {
    //   start: {
    //     5076: 0x959a,
    //   },
    //   data: padNops([0x01, 0x20, 0x60, 0x74], 1),
    // },
    // {
    //   start: {
    //     5076: 0x95b8,
    //   },
    //   data: [0x01],
    // },
    // {
    //   start: {
    //     5076: 0x95b6,
    //   },
    //   data: padNops([], 20),
    // },
  ],
}

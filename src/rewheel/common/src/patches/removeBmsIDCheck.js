import { allGenerations } from "../../../board.js"
import { nop, padNops } from "../utils/helpers.js"

export const removeBmsIDCheck = {
  priority: 0,
  supported: allGenerations,
  modifications: [
    {
      start: {
        5040: 0xebe4,
        5046: 0xed26,
        5050: 0xec64,
      },
      data: padNops([0x10, 0x45, 0x08, 0x45], 11),
    },
    {
      start: {
        4144: 0xeb24
      },
      data: padNops([0x10, 0x45, 0x08, 0x45], 19)
    },
    {
      start: {
        5076: 0xea62,
      },
      data: nop,
    },
    {
      start: {
        5076: 0xea66,
      },
      data: padNops([], 2),
    },
    {
      start: {
        5076: 0xea74,
      },
      data: padNops([], 43),
    },
    {
      start: {
        5076: 0xb268,
      },
      data: nop,
    },
    {
      start: {
        5076: 0xb26c,
      },
      data: nop,
    },
  ],
}

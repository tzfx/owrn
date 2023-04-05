import { allGenerations } from "../../../board.js"

export const clearSettings = {
  priority: 0,
  supported: allGenerations,
  experimental: true,
  modifications: [
    {
      start: (_revision) => {
        return 0xfc00
      },
      data: new Array(80).fill(0xff),
    },
  ],
}

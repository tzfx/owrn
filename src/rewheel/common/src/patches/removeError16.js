import { padNops } from "../utils/helpers.js"

export const removeError16 = {
  priority: 0,
  supported: [7],
  experimental: true,
  modifications: [
    {
      start: {
        5076: 0xeb82,
      },
      data: padNops(
        [0x00, 0x23, 0xae, 0xf8, 0x00, 0x30, 0x05, 0x25, 0xe5, 0x70],
        9
      ),
    },
  ],
}

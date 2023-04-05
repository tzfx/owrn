export const enablePintCustomShaping = {
  priority: 0,
  supported: [5, 7],
  modifications: [
    {
      start: {
        5040: 0xb19c,
        5046: 0xb280,
        5050: 0xb148,
        5076: 0xad54,
      },
      data: [0x05],
    },
    {
      start: {
        5040: 0xa702,
        5046: 0xa7ea,
        5050: 0xa8de,
        5076: 0x9f34,
      },
      data: [0x05],
    },
    {
      start: {
        5040: 0xb82e,
        5046: 0xb924,
        5050: 0xb7c4,
        5076: 0xb3d2,
      },
      data: [0x0a],
    },
    {
      start: {
        5040: 0x3bb2
      },
      data: [0x06]
    }
  ],
}

export const convertRedwoodToSequoia = [
  {
    start: {
      5040: 0xa82a,
      5046: 0xa912,
      5050: 0xaa06,
    },
    data: [0x33, 0x40],
  },
]

export const convertSkylineToDelirium = [
  {
    start: {
      5046: 0xaafe,
      5050: 0xabf2,
    },
    data: [0x0a],
  },
  {
    start: {
      5040: 0xa9fa,
      5046: 0xaae2,
      5050: 0xabd6,
    },
    data: [0x88, 0x30],
  },
  {
    start: {
      5040: 0xa9fc,
    },
    data: [0x46, 0xf2, 0x84, 0x71]
  },
  {
    start: {
      5040: 0xaa16,
    },
    data: [0x06]
  },
  {
    start: {
      5040: 0xaa52,
    },
    data: [0xc0]
  },
  {
    start: {
      5040: 0xaa56,
    },
    data: [0x63]
  },
  {
    start: {
      5040: 0xa8c4,
    },
    data: [0x35]
  },
  {
    start: {
      5040: 0xa8be,
    },
    data: [0x06]
  },
  {
    start: {
      5040: 0x71e8
    },
    data: [0x70]
  },
  {
    start: {
      5046: 0xaae6,
      5050: 0xabda,
    },
    data: [0x84, 0x71],
  },
  {
    start: {
      5046: 0xab36,
      5050: 0xac34,
    },
    data: [0x0a],
  },
]

export const convertPintModesToXRModes = [
  {
    start: {
      5046: 0xa9a6,
      5050: 0xaa9a,
    },
    data: [0x0a],
  },
]

export const increasePintAggressiveness = [
  {
    start: {
      5046: 0xc3c6,
      5050: 0xc262,
    },
    data: [0xa4, 0x61],
  },
  {
    start: {
      5046: 0xc3ca,
      5050: 0xc266,
    },
    data: [0x61, 0x72],
  },
]

export const convertPintModeBehaviorToXR = {
  priority: 0,
  supported: [5, 7],
  confirm: true,
  modifications: [
    ...convertPintModesToXRModes,
    ...convertRedwoodToSequoia,
    ...convertSkylineToDelirium,
    ...increasePintAggressiveness,
    // {
    //   start: {
    //     5076: 0x9f38,
    //   },
    //   data: [0xb6, 0x5a],
    // },
    // {
    //   start: {
    //     5076: 0xa102,
    //   },
    //   data: [0x0a],
    // },
    // {
    //   start: {
    //     5076: 0xa046,
    //   },
    //   data: [0x33, 0x44],
    // },
    // {
    //   start: {
    //     5076: 0xa1e2,
    //   },
    //   data: [0x0a],
    // },
    // {
    //   start: {
    //     5076: 0xa20e,
    //   },
    //   data: [0x0a],
    // },
    // {
    //   start: {
    //     5076: 0xa230,
    //   },
    //   data: [0x0a],
    // },
    // {
    //   start: {
    //     5076: 0xa264,
    //   },
    //   data: [0xc0, 0x20, 0x6f, 0xf0, 0x4d, 0x04],
    // },
    // {
    //   start: {
    //     5076: 0x7024,
    //   },
    //   data: [0x0a],
    // },
  ],
}

export const convertPintXModesToXRModes = [
  {
    start: {
      5076: 0xa0d8,
    },
    data: [0x35, 0x5a],
  },
  {
    start: {
      5076: 0xa102,
    },
    data: [0x0a],
  },
  {
    start: {
      5076: 0xa046,
    },
    data: [0x33, 0x44],
  },
  {
    start: {
      5076: 0xa1e6,
    },
    data: [0x0a],
  },
  {
    start: {
      5076: 0xa242,
    },
    data: [0x0a],
  },
  {
    start: {
      5076: 0xa264,
    },
    data: [0xc0, 0x20, 0x6f, 0xf0, 0x4d, 0x04],
  },
  {
    start: {
      5076: 0x7028,
    },
    data: [0x0a],
  },
]

export const convertPintXModeBehaviorToXR = {
  priority: 0,
  supported: [7],
  modifications: [...convertPintXModesToXRModes],
}

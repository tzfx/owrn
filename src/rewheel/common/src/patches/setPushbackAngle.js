// import { allGenerations } from "../utils/board"

// export const setPushbackAngle = {
//   priority: 1,
//   description: `Sets the angle your board rises to in pushback`,
//   supported: allGenerations,
//   args: {
//     pushbackAngle: {
//       description:
//         "Angle (up to two decimal places)",
//       required: true,
//       type: 'number',
//       min: 0,
//       max: 10
//     },
//   },
//   modifications: ({ pushbackAngle }) => {
//     pushbackAngle = Math.round(parseFloat(pushbackAngle) * 100)
//     if (isNaN(pushbackAngle))
//       throw "Invalid pushback angle value"

//     if (pushbackAngle < 0 || pushbackAngle > 1000)
//       throw "Pushback angle out of accepted range"
//     const buffer = new Uint8Array(2)
//     const view = new DataView(buffer.buffer)
//     view.setUint16(0, pushbackAngle)
//     return [
//       {
//         start: {
//           5040: 0xa8cc,
//         },
//         data: Array.from(buffer),
//       },
//       {
//         start: {
//           5040: 0xa8c8,
//         },
//         data: Array.from(buffer),
//       },
//       {
//         start: {
//           // 5040: 0xaa1e,
//         },
//         data: Array.from(buffer),
//       },
//       {
//         start: {
//           // 5040: 0xaa22,
//         },
//         data: Array.from(buffer),
//       },
//     ]
//   },
// }

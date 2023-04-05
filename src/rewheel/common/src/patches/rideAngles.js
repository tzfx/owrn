import { allGenerations } from "../../../board.js"
import { printArgs } from "../utils/helpers.js"

/*
calculate angles:
(angle * 100) + 36000 / 256 => store in first byte
(angle * 100) + 36000 % 256 => store in second byte
*/

export const getAngleScalarAndRemainder = (angle) => {
  const normalized = (angle * 100) + 36000
  const scalar = Math.floor(normalized / 256) - 0x80  // - 0x80 hack. works for now but need to figure out actual math
  const remainder = normalized % 256
  return { scalar, remainder }
}

export const getAngleAndBackwardAngle = (angle, backwardAngle) => {
  angle = parseFloat(angle).toFixed(2)

  if (backwardAngle)
    backwardAngle = parseFloat(backwardAngle).toFixed(2)
  else
    backwardAngle = angle

  printArgs({ angle, backwardAngle })

  if (angle < -10.00 || angle > 10.00 || isNaN(angle))
    throw `invalidAngle`

  if (backwardAngle < -10.00 || backwardAngle > 10.00 || isNaN(backwardAngle))
    throw `invalidBackwardAngle`

  angle = getAngleScalarAndRemainder(angle)
  backwardAngle = getAngleScalarAndRemainder(backwardAngle, true)

  return { angle, backwardAngle }
}

export const changeElevatedAngle = {
  supported: allGenerations,
  args: {
    elevatedAngle: {
      required: true
    },
    elevatedBackwardAngle: {
      required: false
    }
  },
  modifications: ({ elevatedAngle, elevatedBackwardAngle }) => {
    const {
      angle: { scalar: forwardAngleScalar, remainder: forwardAngleRemainder },
      backwardAngle: { scalar: backwardAngleScalar, remainder: backwardAngleRemainder }
    } = getAngleAndBackwardAngle(elevatedAngle, elevatedBackwardAngle)

    return [
      {
        start: {
          5046: 0x8524
        },
        data: forwardAngleScalar
      },
      {
        start: {
          5046: 0x8526
        },
        data: forwardAngleRemainder
      },
      {
        start: {
          5046: 0x84FA
        },
        data: backwardAngleScalar
      },
      {
        start: {
          5046: 0x84FC
        },
        data: backwardAngleRemainder
      }
    ]
  }
}

export const changeDeliriumSkylineAngle = {
  priority: 0,
  supported: allGenerations,
  args: {
    deliriumSkylineAngle: {
      required: true
    },
    deliriumSkylineBackwardAngle: {
      required: false
    }
  },
  modifications: ({ deliriumSkylineAngle, deliriumSkylineBackwardAngle }) => {
    const {
      angle: { scalar: forwardAngleScalar, remainder: forwardAngleRemainder },
      backwardAngle: { scalar: backwardAngleScalar, remainder: backwardAngleRemainder }
    } = getAngleAndBackwardAngle(deliriumSkylineAngle, deliriumSkylineBackwardAngle)

    return [
      {
        start: {
          5046: 0x855C
        },
        data: forwardAngleScalar
      },
      {
        start: {
          5046: 0x855E
        },
        data: forwardAngleRemainder
      },
      {
        start: {
          5046: 0x856E
        },
        data: backwardAngleScalar
      },
      {
        start: {
          5046: 0x8570
        },
        data: backwardAngleRemainder
      }
    ]
  }
}

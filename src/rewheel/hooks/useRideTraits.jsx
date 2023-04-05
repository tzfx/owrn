import { useEffect } from "react"
import { useState } from "react"
import { rescale } from "../utils"
import { useBLECharacteristic } from "./useBLECharacteristic"

const RideTrait = {
  angleOffset: 0,
  turnCompensation: 1,
  aggressiveness: 2,
  simpleStop: 3,
}

export const useRideTraits = () => {
  const {
    rideTrait,
    writeRideTrait,
    startRideTraitNotifications,
    stopRideTraitNotifications,
  } = useBLECharacteristic("rideTrait", {
    read: true,
    write: true,
    notify: true,
    autoMount: true,
  })

  const [state, setState] = useState({
    angleOffset: null,
    turnCompensation: null,
    aggressiveness: null,
    simpleStop: null,
  })

  const setRideTrait = async (trait, value) => {
    const data = new Uint8Array(2)
    const view = new DataView(data.buffer)
    view.setUint8(0, trait)
    view.setUint8(1, value)
    console.log("setting", trait, value)
    await writeRideTrait(view)
  }

  const setAngleOffset = async (angleOffset) => {
    setState({
      ...state,
      angleOffset,
    })
    angleOffset = Math.round(angleOffset / -0.05)
    await setRideTrait(RideTrait.angleOffset, angleOffset)
  }

  const setTurnCompensation = async (turnCompensation) => {
    setState({
      ...state,
      turnCompensation,
    })
    turnCompensation = Math.round(rescale(turnCompensation, 0, 10, -100, 100))
    await setRideTrait(RideTrait.turnCompensation, turnCompensation)
  }

  const setAggressiveness = async (aggressiveness) => {
    setState({
      ...state,
      aggressiveness,
    })
    aggressiveness = Math.round(rescale(aggressiveness, 0, 10, -80, 127))
    await setRideTrait(RideTrait.aggressiveness, aggressiveness)
  }

  const setSimpleStop = async (enabled) => {
    setState({
      ...state,
      simpleStop: enabled,
    })
    await setRideTrait(RideTrait.simpleStop, enabled ? 0x01 : 0x00)
  }

  const { angleOffset, turnCompensation, aggressiveness, simpleStop } = state

  const isValid = () =>
    angleOffset !== null &&
    turnCompensation !== null &&
    aggressiveness !== null &&
    simpleStop !== null

  const refreshRideTraits = async () => {
    setState({
      angleOffset: null,
      turnCompensation: null,
      aggressiveness: null,
      simpleStop: null,
    })
    await startRideTraitNotifications()
  }

  useEffect(() => {
    refreshRideTraits()
  }, [])

  useEffect(() => {
    if (!rideTrait) return

    const traitType = rideTrait.getUint8(0)
    const value = rideTrait.getInt8(1)
    switch (traitType) {
      case RideTrait.angleOffset:
        setState({
          ...state,
          angleOffset: value * -0.05,
        })
        break
      case RideTrait.turnCompensation:
        setState({
          ...state,
          turnCompensation: rescale(value, -100, 100, 0, 10),
        })
        break
      case RideTrait.aggressiveness:
        setState({
          ...state,
          aggressiveness: rescale(value, -80, 127, 0, 10),
        })
        break
      case RideTrait.simpleStop:
        setState({
          ...state,
          simpleStop: value === 0x01,
        })
        break
    }

    if (isValid()) stopRideTraitNotifications()
  }, [rideTrait])

  return {
    ...state,
    valid: isValid(),
    setAngleOffset,
    setTurnCompensation,
    setAggressiveness,
    setSimpleStop,
    refreshRideTraits,
  }
}

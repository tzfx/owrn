import { useContext } from "react"
import { OnewheelContext } from "../components/OnewheelProvider"
import { useFirmwareRevision, useHardwareRevision } from "./useOnewheelInfo"

export const RidingTrait = {
  angleOffset: 0,
  turnCompensation: 1,
  aggressiveness: 2,
  simpleStop: 3,
}

export const useOnewheel = () => {
  const {
    device,
    supported,
    requestDevice,
    connect,
    disconnect,
    connectionState,
    characteristics,
    error,
  } = useContext(OnewheelContext)

  const onewheel = {
    device,
    connectionState,
    connect,
    disconnect,
    requestDevice,
    supported,
    error,
    characteristics,
  }

  return { ...onewheel }
}

export const withOnewheel = (Component) => {
  const onewheel = useOnewheel()
  const firmwareRevision = useFirmwareRevision()
  const hardwareRevision = useHardwareRevision()

  return (props) => (
    <Component
      onewheel={{
        ...onewheel,
        firmwareRevision,
        hardwareRevision,
      }}
      {...props}
    />
  )
}

export const withOnewheelSerial = (Component) => {
  const {
    device,
    connectionState,
    characteristics,
    supported,
    firmwareRevision,
    hardwareRevision,
  } = useOnewheel()
  const { serialRead, serialWrite } = characteristics
  return (props) => (
    <Component
      onewheel={{
        device,
        connectionState,
        supported,
        serialRead,
        serialWrite,
        firmwareRevision,
        hardwareRevision,
      }}
      {...props}
    />
  )
}

import { useBLECharacteristic } from "./useBLECharacteristic"

export const useLights = () => {
  const { lights, writeLights } = useBLECharacteristic("lights", {
    read: true,
    write: true,
    notify: true,
  })

  const setLights = async (enabled, brightness = 0) => {
    let buffer, view
    brightness = Math.round(brightness * 255)
    buffer = new Uint8Array(2)
    view = new DataView(buffer.buffer)
    view.setUint8(1, enabled)
    view.setUint8(0, brightness)
    await writeLights(view)
  }

  const parseLights = (view) => {
    if (!view) return null
    return { enabled: view.getUint8(1) === 1, brightness: view.getUint8(0) }
  }

  return {
    lights: parseLights(lights),
    setLights,
  }
}

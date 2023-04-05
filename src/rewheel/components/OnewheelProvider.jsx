import { Component, createContext } from "react"
import {
  ONEWHEEL_SERVICE_UUID,
  characteristics as bleCharacteristics,
} from "../ble"
import * as _ from "lodash"
import { bleQueue } from "@hooks"

export const ConnectionState = {
  disconnected: 0,
  connecting: 1,
  connected: 2,
}

export const OnewheelContext = createContext({
  device: null,
  requestDevice: null,
  connect: null,
  disconnect: null,
  connectionState: ConnectionState.disconnected,
  characteristics: null,
  error: null,
})

export class OnewheelProvider extends Component {
  constructor(props) {
    super(props)

    this.state = {
      connectionState: ConnectionState.disconnected,
      supported: navigator.bluetooth !== undefined,
      device: null,
      characteristics: null,
      error: null,
    }
  }

  async requestDevice() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [ONEWHEEL_SERVICE_UUID] }],
      })
      this.setState({
        ...this.state,
        device,
      })
    } catch (err) {
      console.error(err)
      this.setState({
        ...this.state,
        connectionState: ConnectionState.disconnected,
        error: err,
      })
    }
  }

  async connect(device) {
    try {
      this.setState({
        ...this.state,
        connectionState: ConnectionState.connecting,
      })

      device.addEventListener(
        "gattserverdisconnected",
        this.onDisconnected.bind(this)
      )

      const server = await device.gatt.connect()
      const service = await server.getPrimaryService(ONEWHEEL_SERVICE_UUID)
      const characteristics = await service.getCharacteristics()

      let characteristicMap = {}
      characteristics.forEach((characteristic) => {
        const mapped = bleCharacteristics.find(
          (c) => c.uuid === characteristic.uuid
        )
        characteristicMap[mapped.characteristic] = characteristic
      })

      this.setState({
        ...this.state,
        connectionState: ConnectionState.connected,
        characteristics: characteristicMap,
      })
    } catch (err) {
      console.error(err)
      this.setState({
        ...this.state,
        connectionState: ConnectionState.disconnected,
        device: null,
        error: err,
      })
    }
  }

  async disconnect() {
    const { device } = this.state
    if (device) {
      await device.gatt.disconnect()
      this.setState({
        ...this.state,
        connectionState: ConnectionState.disconnected,
      })
      device.removeEventListener(
        "gattserverdisconnected",
        this.onDisconnected.bind(this)
      )
    }
  }

  async onDisconnected() {
    this.setState({
      ...this.state,
      connectionState: ConnectionState.disconnected,
      device: null,
      characteristics: null,
      error: null,
    })
  }

  render() {
    const { supported, connectionState, characteristics, error, device } =
      this.state
    return (
      <OnewheelContext.Provider
        value={{
          device,
          supported,
          connectionState,
          characteristics,
          error,
          requestDevice: this.requestDevice.bind(this),
          connect: this.connect.bind(this),
          disconnect: this.disconnect.bind(this),
          bleQueue: bleQueue,
        }}
      >
        {this.props.children}
      </OnewheelContext.Provider>
    )
  }
}

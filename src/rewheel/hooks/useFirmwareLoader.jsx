import { TextField } from "@mui/material"
import { useEffect, useState } from "react"

export const useFirmwareLoader = () => {
  const [file, setFile] = useState(null)
  const [firmware, setFirmware] = useState(null)

  const loadFirmware = async () => {
    const reader = new FileReader()
    setFirmware(null)

    reader.addEventListener("load", (event) => {
      setFirmware(event.target.result)
    })

    reader.readAsArrayBuffer(file)
  }

  const clearFirmware = () => {
    setFile(null)
    setFirmware(null)
  }

  useEffect(() => {
    if (!file) return
    loadFirmware()
  }, [file])

  return {
    file,
    firmware,
    loadFirmware,
    clearFirmware,
    fileSelected: !!file,
    showFirmwareInput: () => (
      <TextField
        type="file"
        accept=".bin"
        onChange={(event) => setFile(event.target.files[0])}
      />
    ),
  }
}

// generates checksum for a firmware file
// use this to update the firmware.json map
import { checksums, encryptedChecksums } from "../checksums.js"
import SparkMD5 from "spark-md5"

export const checksumForFirmware = (buffer, skipSlice = false) => {
  const md5 = new SparkMD5.ArrayBuffer()
  let ota = false
  // from start of main stack pointer to before flash preferences
  // likely a dumped firmware
  if (buffer.byteLength >= 0xfc00 && !skipSlice) {
    md5.append(buffer.slice(0x3000, 0xfc00))
    ota = false
  } else {
    ota = true
    md5.append(buffer)
  }

  return { checksum: md5.end(), ota }
}

export const matchFirmwareRevision = (checksum) => {
  const revision = checksums[checksum]
  if (revision === undefined) return encryptedChecksums[checksum]
  return revision
}

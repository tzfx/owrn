import aesjs from "aes-js"
import { fromHexString, toHexString } from "./helpers.js"
import SparkMD5 from "spark-md5"

const VALID_KEY_MD5_HASH = "21042881df30523ceaa59af77d5eeaf9"

export const decryptFirmware = (firmware, key) => {
  const keyData = fromHexString(key)
  const ecb = new aesjs.ModeOfOperation.ecb(keyData)
  const buffer = new Uint8Array(firmware)
  const decrypted = ecb.decrypt(buffer)
  return decrypted
}

export const encryptFirmware = (firmware, key) => {
  const keyData = fromHexString(key)
  const ecb = new aesjs.ModeOfOperation.ecb(keyData)
  const buffer = new Uint8Array(firmware)
  const encrypted = ecb.encrypt(buffer)
  return encrypted
}

export const isValidKey = (key) => {
  const md5 = new SparkMD5.ArrayBuffer()
  const converted = fromHexString(key)
  md5.append(converted)
  const hashed = md5.end(false)
  return hashed === VALID_KEY_MD5_HASH
}

export const extractKey = (firmware) => {
  const uint32Size = 4

  for (var i = 0; i < firmware.byteLength - 16; i += 4) {
    ``
    const view = new DataView(firmware, i, 16)
    const part1 = toHexString(view.getUint32(0))
    const part2 = toHexString(view.getUint32(uint32Size * 1))
    const part3 = toHexString(view.getUint32(uint32Size * 2))
    const part4 = toHexString(view.getUint32(uint32Size * 3))
    const potentialKey = `${part1}${part2}${part3}${part4}`.padStart(32, '0')
    if (isValidKey(potentialKey))
      return potentialKey
  }

  return null
}

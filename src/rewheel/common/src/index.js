export * as patches from "./patches/index.js"
export { checksumForFirmware, matchFirmwareRevision } from "./utils/checksum.js"
export { applyPatch, getMissingArgs } from "./utils/applyPatch.js"
export {
  BoardGeneration,
  inferBoardFromHardwareRevision,
  inferBoardFromFirmwareRevision,
  allGenerations,
} from "../../board.js"
export { fromHexString, printArgs } from "./utils/helpers.js"
export {
  extractKey,
  isValidKey,
  decryptFirmware,
  encryptFirmware,
} from "./utils/encryption.js"

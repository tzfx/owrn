export const nop = [0x00, 0xbf]
export const padNops = (data, count) =>
  count == 0 ? data : padNops(data.concat(nop), count - 1)

export const printArgs = (args) => {
  for (const arg of Object.keys(args))
    console.debug(` - \x1b[33m${arg}\x1b[0m: ${args[arg]}`)
}

export const fromHexString = (hexString) => {
  const bytes = hexString.match(/.{1,2}/g)
  if (!bytes) return null
  // eslint-disable-next-line no-undef
  return Uint8Array.from(bytes.map((byte) => parseInt(byte, 16)))
}

export const toHexString = (number) => {
  return number.toString(16)
}
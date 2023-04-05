export const applyPatch = (firmware, revision, patch, args) => {
  let modifications = []

  if (typeof patch.modifications === "function") {
    modifications = patch.modifications({ ...args, revision })
  } else modifications = patch.modifications

  const view = new DataView(firmware)

  let applied = false
  for (const mod of modifications) {
    let start
    if (typeof mod.start === "function") start = mod.start(revision)
    else if (!mod.start[revision]) {
      console.warn(`skipping modification for ${revision}`)
      continue
    } else start = mod.start[revision]

    applied = true

    for (let offset = 0; offset < mod.data.length; offset++)
      view.setUint8(start + offset, mod.data[offset])
  }

  return { firmware, applied }
}

export const getMissingArgs = (args, patch) => {
  if (!patch.args) return []

  const missingArgs = []
  for (const arg of Object.keys(patch.args)) {
    if (!args[arg] && patch.args[arg].required) missingArgs.push(arg)
  }

  return missingArgs
}

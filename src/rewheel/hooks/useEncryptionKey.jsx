import { useEffect, useState } from "react"
import localforage from "localforage"

export const useEncryptionKey = () => {
  const [key, setKey] = useState(null)
  useEffect(() => {
    const loadKey = async () => {
      const key = await localforage.getItem("decryption-key")
      setKey(key)
    }

    loadKey()
  }, [])

  return key
}

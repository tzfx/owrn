import { useState } from "react"
import { useEffect } from "react"
import { useBLECharacteristic } from "../hooks/useBLECharacteristic"
import {
  UPDATE_FAIL_CORRUPT,
  UPDATE_FAIL_FILE_SIZE,
  UPDATE_FAIL_TIMEOUT,
  UPDATE_READY_TO_START,
} from "../messages"
import { typedArraysAreEqual } from "../utils"

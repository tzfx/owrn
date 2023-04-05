import {
  Card,
  Button,
  CardContent,
  CardHeader,
  LinearProgress,
  Typography,
} from "@mui/material"
import { useContext } from "react"
import { useEffect } from "react"
import { ConnectionState, OnewheelContext } from "./OnewheelProvider"
import { Trans, useTranslation } from "react-i18next"

export const NotSupported = ({ t }) => (
  <Card sx={{ my: 1 }}>
    <CardHeader
      title={t("notSupported.title")}
      subheader={t("notSupported.subheader")}
    />
    <CardContent>
      <Typography variant="body1">
        <Trans t={t} i18nKey="notSupported.browserSuggestion">
          X<a href="https://caniuse.com/web-bluetooth">supported browsers.</a>Y
        </Trans>
      </Typography>
    </CardContent>
  </Card>
)

const Disconnected = ({ t, onClick, state, title, subheader }) => (
  <Card sx={{ my: 1 }}>
    <CardHeader title={title} subheader={subheader} />
    <CardContent>
      <Button
        onClick={onClick}
        variant="outlined"
        disabled={state === ConnectionState.connecting}
        sx={{ my: 1 }}
      >
        {state === ConnectionState.connecting
          ? t("connectionManager.connecting")
          : t("connectionManager.connect")}
      </Button>
      {state === ConnectionState.connecting && (
        <LinearProgress sx={{ my: 1 }} />
      )}
    </CardContent>
  </Card>
)

export const ConnectionManager = ({ children, title, subheader }) => {
  const { t } = useTranslation("common")
  const { supported, connectionState, connect, requestDevice, device } =
    useContext(OnewheelContext)

  if (!supported) return <NotSupported t={t} />

  useEffect(() => {
    if (device && connectionState === ConnectionState.disconnected) {
      console.log("attempting to connect to device")
      connect(device)
    }
  }, [device])

  switch (connectionState) {
    case ConnectionState.disconnected:
    case ConnectionState.connecting:
      return (
        <Disconnected
          onClick={() => requestDevice()}
          state={connectionState}
          title={title}
          subheader={subheader}
          t={t}
        />
      )
    case ConnectionState.connected:
    default:
      return <>{children}</>
  }
}

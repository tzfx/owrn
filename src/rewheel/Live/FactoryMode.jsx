import { RideMode, useRideMode } from "@hooks"
import { useTranslation } from "react-i18next"

export const FactoryMode = () => {
  const { t } = useTranslation("live")
  const { rideMode, setRideMode } = useRideMode()

  const enterFactoryMode = async () => {
    await setRideMode(RideMode.EnterFactoryMode)
  }

  const calibrateMotor = async () => {
    await setRideMode(RideMode.CalibrateMotor)
  }

  const calibrateMotorOld = async () => {
    await setRideMode(RideMode.CalibrateMotorOld)
  }

  const recalibrate = async () => {
    await setRideMode(RideMode.CalibrateRepair)
  }

  let content, subheader
  if (!rideMode) {
    subheader = "Unknown"
    content = <Typography variant="body1">{t("noData")}</Typography>
  }

  switch (rideMode) {
    case RideMode.FactoryMode:
      subheader = t("factoryMode.inFactoryMode")
      content = (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t("factoryMode.instructions")}
          </Typography>
          <Button
            onClick={() => calibrateMotor()}
            variant="outlined"
            sx={{ margin: 1 }}
          >
            {t("factoryMode.motorCalibration")}
          </Button>
          <Button
            onClick={() => calibrateMotorOld()}
            variant="outlined"
            sx={{ margin: 1 }}
          >
            {t("factoryMode.motorCalibrationPre")}
          </Button>
          <Button
            onClick={() => recalibrate()}
            variant="outlined"
            sx={{ margin: 1 }}
          >
            {t("factoryMode.hardReset")}
          </Button>
        </Box>
      )
      break
    default:
      subheader = t("factoryMode.notInFactoryMode")
      content = (
        <Box>
          <Button onClick={() => enterFactoryMode()} variant="outlined">
            {t("factoryMode.actions.enterFactoryMode")}
          </Button>
        </Box>
      )
  }

  return (
    <Card sx={{ my: 2 }}>
      <CardHeader title={t("factoryMode.title")} subheader={subheader} />
      <CardContent>{content}</CardContent>
    </Card>
  )
}

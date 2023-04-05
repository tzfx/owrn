import {
  Card,
  CardContent,
  CardHeader,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from "@mui/material"
import {
  BoardGeneration,
  inferBoardFromHardwareRevision,
} from "@rewheel/common"
import { useLights, useHardwareRevision } from "@hooks"
import {
  RideMode,
  RideModeReverseMap,
  useRideMode,
  useRideTraits,
} from "@hooks"
import FlashlightOffIcon from "@mui/icons-material/FlashlightOff"
import FlashlightOnIcon from "@mui/icons-material/FlashlightOn"
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn"
import DoDisturbOffIcon from "@mui/icons-material/DoDisturbOff"
import { useTheme } from "@emotion/react"
import { useTranslation } from "react-i18next"

const RideMapV1 = [RideMode.V1Classic, RideMode.V1Extreme, RideMode.V1Elevated]

const RideMapPlusXR = [
  RideMode.Sequoia,
  RideMode.CruzRedwood,
  RideMode.MissionPacific,
  RideMode.Elevated,
  RideMode.DeliriumSkyline,
  RideMode.Custom,
]
const RideMapPintPintX = RideMapPlusXR.slice(1)

export const RideBehavior = () => {
  const hardwareRevision = useHardwareRevision()
  const { rideMode, setRideMode } = useRideMode()
  const { lights, setLights } = useLights()
  const theme = useTheme()
  const { t } = useTranslation("live")
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("sm"))
  const {
    turnCompensation,
    angleOffset,
    aggressiveness,
    simpleStop,
    setAggressiveness,
    setTurnCompensation,
    setAngleOffset,
    setSimpleStop,
    valid: rideTraitsValid,
  } = useRideTraits()
  const generation =
    BoardGeneration[inferBoardFromHardwareRevision(hardwareRevision)]
  let rideModes = []

  switch (generation) {
    case BoardGeneration.V1:
    case BoardGeneration.V1_2:
      rideModes = RideMapV1
      break
    case BoardGeneration.Plus:
    case BoardGeneration.XR:
      rideModes = RideMapPlusXR
      break
    case BoardGeneration.Pint:
    case BoardGeneration.PintX:
      rideModes = RideMapPintPintX
      break
    default:
      //todo for GT
      break
  }

  return (
    <Card sx={{ my: 1 }}>
      <CardHeader title={t("rideBehavior.title")} />
      <CardContent>
        <Stack spacing={2} direction="column">
          <Stack
            spacing={4}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body1">{t("rideBehavior.lights")}</Typography>
            <ToggleButton
              selected={lights?.enabled}
              onClick={() => setLights(!lights?.enabled)}
            >
              {lights?.enabled ? <FlashlightOffIcon /> : <FlashlightOnIcon />}
            </ToggleButton>
            {generation === BoardGeneration.GT && lights?.enabled && (
              <Slider
                value={lights?.brightness}
                valueLabelDisplay="auto"
                onChange={(value) => setLights(lights?.enabled, value / 100)}
              />
            )}
          </Stack>
          {generation >= BoardGeneration.Plus && (
            <Stack
              spacing={4}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body1">
                {t("rideBehavior.simpleStop")}
              </Typography>
              <ToggleButton
                selected={simpleStop ?? false}
                onClick={() => setSimpleStop(!simpleStop)}
              >
                {simpleStop ? <DoDisturbOffIcon /> : <DoDisturbOnIcon />}
              </ToggleButton>
            </Stack>
          )}
          <Stack
            spacing={{ xs: 1, sm: 4 }}
            direction={{ sm: "column", md: "row" }}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body1">{t("rideBehavior.mode")}</Typography>
            <ToggleButtonGroup
              exclusive
              value={rideMode}
              orientation={isLargeScreen ? "horizontal" : "vertical"}
            >
              {rideModes.map((mode) => (
                <ToggleButton
                  color="primary"
                  value={mode}
                  key={mode}
                  onClick={() => setRideMode(mode)}
                >
                  {RideModeReverseMap(generation)[mode]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
          {rideMode === RideMode.Custom && rideTraitsValid && (
            <Stack
              spacing={4}
              direction={{ sm: "column", md: "row" }}
              alignItems="center"
            >
              <Stack spacing={2} direction="column" alignItems="center">
                <Typography variant="body1">
                  {t("rideBehavior.customShaping.carveability")}
                </Typography>
                <Slider
                  value={turnCompensation}
                  min={0}
                  max={10}
                  step={1.0}
                  marks
                  sx={{ width: 150 }}
                  valueLabelDisplay="auto"
                  onChange={(event) => setTurnCompensation(event.target.value)}
                />
              </Stack>
              <Stack spacing={2} direction="column" alignItems="center">
                <Typography variant="body1">
                  {t("rideBehavior.customShaping.angleOffset")}
                </Typography>
                <Slider
                  value={angleOffset}
                  min={-1.5}
                  max={3}
                  step={0.1}
                  marks
                  sx={{ width: 150 }}
                  valueLabelDisplay="auto"
                  onChange={(event) => setAngleOffset(event.target.value)}
                />
              </Stack>
              <Stack spacing={2} direction="column" alignItems="center">
                <Typography variant="body1">
                  {t("rideBehavior.customShaping.aggressiveness")}
                </Typography>
                <Slider
                  value={aggressiveness}
                  min={0}
                  max={10}
                  sx={{ width: 150 }}
                  step={1.0}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(event) => setAggressiveness(event.target.value)}
                />
              </Stack>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

import { Typography } from "@mui/material"

export const EnforceGeneration = ({
  generation,
  allowedGenerations,
  children,
}) => {
  if (!generation || allowedGenerations.indexOf(generation) === -1)
    return (
      <Typography variant="body1">
        This feature is not supported for your board.
      </Typography>
    )
  return <>{children}</>
}

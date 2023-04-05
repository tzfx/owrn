import {
  useBatteryPercentage,
  useBatterySerialNumber,
  useBatteryTemperature,
  useBatteryVoltage,
} from '../hooks';

export const BatteryInfo = () => {
  const batteryVoltage = useBatteryVoltage();
  const batteryPercentage = useBatteryPercentage();
  const batteryTemperature = useBatteryTemperature();
  const serialNumber = useBatterySerialNumber();
  const {t} = useTranslation('live');

  return (
    <Card sx={{my: 2}}>
      <CardHeader
        title={t('battery.title')}
        subheader={t('battery.serialNumber', {serialNumber})}
      />
      <CardContent>
        <Typography variant="h6">{t('battery.stateOfCharge')}</Typography>
        <Typography variant="body1">{batteryVoltage}V</Typography>
      </CardContent>
    </Card>
  );
};

import React, {useEffect, useMemo, useRef, useState} from 'react';

import {Buffer} from '@craftzdog/react-native-buffer';
import {Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {VictoryBoxPlot, VictoryPie} from 'victory-native';
import {AppConfig, TemperatureUnit} from './StorageService';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './util/bluetooth';

interface Props {
  device?: PeripheralInfo;
  config?: AppConfig;
}

const Battery = ({config, device}: Props) => {
  const [percent, setPercent] = useState<number>(50);
  const [temperature, setTemperature] = useState<number>(20.55);
  const [voltage, setVoltage] = useState<number>(52);

  function convertTemperature(temp: number, unit: TemperatureUnit) {
    switch (unit) {
      case 'C':
        return temp;
      case 'F':
        return temp * (9 / 5) + 32;
      case 'K':
        return temp + 273.15;
    }
  }

  const temperatureDisplay = useMemo(
    () =>
      [
        convertTemperature(temperature, config?.temperatureUnit ?? 'C').toFixed(
          1,
        ),
        config?.temperatureUnit !== 'K' ? '°' : '',
        config?.temperatureUnit ?? 'C',
        temperature < 3 ? ' 🥶' : '',
      ].join(''),
    [config?.temperatureUnit, temperature],
  );

  function colorScale(value: number, max: number = 100): string {
    // https://coolors.co/e96060-e2852d-f3e189-abc274-359621
    const percentage = value / max;
    if (percentage > 0.75) {
      return '#359621';
    }
    if (percentage > 0.45) {
      return '#abc274';
    }
    if (percentage > 0.3) {
      return '#f3E189';
    }
    if (percentage > 0.2) {
      return '#e2852d';
    }
    return '#e96060';
  }

  const chargeColor = useMemo(() => colorScale(percent), [percent]);

  const batteryPoller = useRef<number>();

  useEffect(() => {
    function refreshBatteryStats() {
      if (device?.id != null) {
        return Promise.all([
          // // TODO: Figure out what the heck to do with cell data.
          // BTManager.read(
          //   device.id,
          //   ONEWHEEL_SERVICE_UUID,
          //   CHARACTERISTICS.batteryCells,
          // ),
          BTManager.read(
            device.id,
            ONEWHEEL_SERVICE_UUID,
            CHARACTERISTICS.batteryPercent,
          ),
          // BTManager.read(
          //   device.id,
          //   ONEWHEEL_SERVICE_UUID,
          //   CHARACTERISTICS.batterySerialNumber,
          // ),
          BTManager.read(
            device.id,
            ONEWHEEL_SERVICE_UUID,
            CHARACTERISTICS.batteryTemperature,
          ),
          BTManager.read(
            device.id,
            ONEWHEEL_SERVICE_UUID,
            CHARACTERISTICS.batteryVoltage,
          ),
        ])
          .then(([rcells, rpercent, rserial]) => {
            const [bpercent, btemp, bvoltage] = [
              // _bcells unused until I figure out how to calculate the output.
              Buffer.from(rcells),
              Buffer.from(rpercent),
              Buffer.from(rserial),
              // Buffer.from(rtemp),
              // Buffer.from(rvoltage),
            ];
            setPercent(bpercent.readUInt8(1));
            setTemperature(btemp.readUInt8(0));
            setVoltage(bvoltage.readInt16BE(0) / 10);
          })
          .catch(() => {
            if (batteryPoller.current != null) {
              clearInterval(batteryPoller.current);
            }
          });
      }
      return Promise.reject('No device connected. (battery)');
    }

    refreshBatteryStats()
      .then(
        () =>
          (batteryPoller.current = setInterval(
            () => refreshBatteryStats(),
            30_000,
          )),
      )
      .catch(err => console.error(err));

    return () => {
      if (batteryPoller.current != null) {
        clearInterval(batteryPoller.current);
      }
    };
  }, [device]);

  return (
    <View>
      <Text style={styles.tempLabel}>{temperatureDisplay}</Text>
      <Text style={{...styles.chartPercentLabel}}>{percent}%</Text>
      <VictoryPie
        height={350}
        startAngle={90}
        endAngle={-90}
        innerRadius={75}
        labels={() => ''}
        style={{
          data: {
            fill: ({datum}) => (datum.x === '' ? 'lightgrey' : chargeColor),
          },
        }}
        data={[
          {x: '', y: 100 - (percent ?? 0)},
          {x: 'charge', y: percent},
        ]}
      />
      <VictoryBoxPlot
        horizontal
        height={50}
        style={{
          parent: {
            marginTop: -175,
          },
          medianLabels: {
            fontSize: 10,
          },
        }}
        medianLabels={() => voltage?.toFixed(1) + 'V'}
        data={[
          {
            x: '',
            min: 43.5,
            median: voltage,
            max: 62.25,
            q1: voltage! - 0.15,
            q3: voltage! + 0.15,
          },
        ]}
      />
    </View>
  );
};

const styles = {
  chartPercentLabel: {
    fontSize: 36,
    marginTop: -50,
    marginLeft: 'auto',
    marginRight: 'auto',
    top: 175,
    left: 5,
  },
  tempLabel: {marginLeft: 40, top: 65},
};

export default Battery;

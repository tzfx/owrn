import React, {useEffect, useRef, useState} from 'react';

import {Buffer} from '@craftzdog/react-native-buffer';
import {StyleSheet, Text, View} from 'react-native';
import BTManager, {PeripheralInfo} from 'react-native-ble-manager';
import {VictoryPie} from 'victory-native';
import {AppConfig, SavedBoard, StorageService} from './StorageService';
import {Typography} from './Typography';
import {CHARACTERISTICS, ONEWHEEL_SERVICE_UUID} from './util/bluetooth';

interface Props {
  board?: SavedBoard;
  device?: PeripheralInfo;
  debug?: boolean;
  config?: AppConfig;
}

const Telemetry = ({board, device, config}: Props) => {
  const [odometer, setOdometer] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [tripRotations, setTripRotations] = useState(0);

  const [metric, setMetric] = useState(false);

  const odometerPoller = useRef<number>();
  const rpmPoller = useRef<number>();

  function calculateSpeed(revs: number, diameter: number = 10.5, km = false) {
    return ((diameter * Math.PI * revs * 60) / (12 * 5_280)) * (km ? 1.609 : 1);
  }
  const speed = calculateSpeed(rpm, board?.wheelSize, metric);

  function rotations2Distance(
    rotations: number,
    diameter: number = 10.5,
    km = false,
  ) {
    return ((diameter * rotations) / (12 * 5_280)) * (km ? 1.609 : 1);
  }

  useEffect(() => {
    function refreshRPM() {
      if (device?.id != null) {
        return BTManager.read(
          device.id,
          ONEWHEEL_SERVICE_UUID,
          CHARACTERISTICS.rpm,
        )
          .then(rrpm => {
            const brpm = Buffer.from(rrpm);
            const currentRPM = brpm.readUInt16BE(0);
            setRpm(currentRPM);
          })
          .catch(() => {
            if (rpmPoller.current != null) {
              clearInterval(rpmPoller.current);
            }
          });
      }
      return Promise.reject('No device connected. (Refresh RPM)');
    }
    function refreshOdometers() {
      if (device != null) {
        return Promise.all([
          BTManager.read(
            device.id,
            ONEWHEEL_SERVICE_UUID,
            CHARACTERISTICS.lifetimeOdometer,
          ),
          BTManager.read(
            device.id,
            ONEWHEEL_SERVICE_UUID,
            CHARACTERISTICS.tripOdometer,
          ),
        ])
          .then(([rlo, rto]) => {
            const [blo, bto] = [Buffer.from(rlo), Buffer.from(rto)];
            setOdometer(blo.readUInt16BE(0));
            setTripRotations(bto.readUInt16BE(0)); // calc based on rotation 2 wheelsize
          })
          .catch(() => {
            if (odometerPoller.current != null) {
              clearInterval(odometerPoller.current);
            }
          });
      }
      return Promise.reject('No device connected. (Refresh Odometers)');
    }

    refreshRPM()
      .then(() => (rpmPoller.current = setInterval(() => refreshRPM(), 750)))
      .catch(err => console.error(err));
    refreshOdometers()
      .then(
        () =>
          (odometerPoller.current = setInterval(
            () => refreshOdometers(),
            30_000,
          )),
      )
      .catch(err => console.error(err));
    return () => {
      if (rpmPoller.current != null) {
        clearInterval(rpmPoller.current);
      }
      if (odometerPoller.current != null) {
        clearInterval(odometerPoller.current);
      }
    };
  }, [device]);

  useEffect(() => {
    if (board != null && speed > (board?.topSpeed ?? 0)) {
      StorageService.saveBoard({...board, topSpeed: speed});
    }
  }, [board, speed]);

  useEffect(() => {
    setMetric(config?.speedUnit === 'KPH');
  }, [config]);

  return (
    <View style={{marginTop: -15}}>
      <VictoryPie
        animate={{duration: 100}}
        height={350}
        startAngle={90}
        endAngle={270}
        innerRadius={75}
        labels={({datum}) =>
          datum.x === 'top' ? (board?.topSpeed ?? 0.0).toFixed(1) : ''
        }
        labelPlacement={'perpendicular'}
        labelPosition={'startAngle'}
        labelRadius={() => 130}
        style={{
          data: {
            fill: ({datum}) =>
              datum.x === ''
                ? 'lightgrey'
                : datum.x === 'top'
                ? '#b9d0df'
                : '#457b9d',
          },
          parent: {
            marginTop: -160,
          },
        }}
        data={[
          {x: '', y: 25.0 - (board?.topSpeed ?? 0)},
          {x: 'top', y: board?.topSpeed ?? 0 - speed},
          {x: 'speed', y: speed || 0.1},
        ]}
      />
      <Text style={styles.speedLabel}>{speed.toFixed(1)}</Text>
      <Text
        style={StyleSheet.compose(styles.speedLabel, {
          fontSize: Typography.fontsize.medium,
        })}>
        {config?.speedUnit.toLowerCase()}
      </Text>
      <Text style={styles.odometerLabel}>
        (
        {rotations2Distance(tripRotations, board?.wheelSize, metric).toFixed(1)}
        ) {(odometer * (metric ? 1.609 : 1)).toFixed(1)} {metric ? 'km' : 'mi'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  speedLabel: {
    fontSize: 36,
    marginLeft: 'auto',
    marginRight: 'auto',
    top: -175,
  },
  odometerLabel: {
    textAlign: 'right',
    marginRight: 40,
    marginTop: -90,
    top: -10,
  },
});

export default Telemetry;

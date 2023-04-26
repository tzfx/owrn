import React, {useEffect, useState} from 'react';
import {
  Button,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {AppConfig} from './StorageService';
import {Typography} from './Typography';

type Props = {
  config: AppConfig;
  handleConfigUpdate: (config: AppConfig) => void;
  style?: any;
};

const ConfigEditor = ({config, handleConfigUpdate, style}: Props) => {
  const [editting, setEditting] = useState(false);
  const [tempConfig, setTempConfig] = useState(config);

  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  return (
    <View style={style}>
      <Pressable onPress={() => setEditting(true)}>
        <Text style={{fontSize: Typography.fontsize.xl}}>≡</Text>
      </Pressable>
      <Modal
        animationType="slide"
        visible={editting}
        onDismiss={() => {
          handleConfigUpdate(tempConfig);
          setEditting(false);
        }}>
        <SafeAreaView style={styles.boxed}>
          <Text style={styles.h1}>User Options</Text>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Speed Unit</Text>
            {['KPH', 'MPH'].map(unit => (
              <Pressable
                key={unit}
                style={styles.optionValue}
                onPress={() => {
                  setTempConfig({...tempConfig, speedUnit: unit as any});
                }}>
                <Text
                  style={
                    tempConfig?.speedUnit === unit
                      ? {...styles.selected}
                      : {...styles.deselected}
                  }>
                  {unit}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Temperature Unit</Text>
            {['C', 'F', 'K'].map(unit => (
              <Pressable
                key={unit}
                onPress={() => {
                  setTempConfig({...tempConfig, temperatureUnit: unit as any});
                }}
                style={styles.optionValue}>
                <Text
                  style={
                    tempConfig?.temperatureUnit === unit
                      ? {...styles.selected}
                      : {...styles.deselected}
                  }>
                  {unit}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Theme</Text>
            {['light', 'dark', 'system'].map(theme => (
              <Pressable
                key={theme}
                onPress={() => {
                  setTempConfig({...tempConfig, theme: theme as any});
                }}
                style={styles.optionValue}>
                <Text
                  style={
                    tempConfig?.theme === theme
                      ? {...styles.selected}
                      : {...styles.deselected}
                  }>
                  {theme}
                </Text>
              </Pressable>
            ))}
          </View>
          <View>
            <Text style={styles.optionLabel}>Saved Boards</Text>
            {[].map(board => (
              <Pressable>
                <Text>{board}</Text>
              </Pressable>
            ))}
          </View>
          <Button
            color={Typography.colors.emerald}
            title="Close"
            onPress={() => setEditting(false)}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  boxed: {top: 60, marginHorizontal: 30},
  h1: {
    fontSize: Typography.fontsize.medium,
    paddingBottom: 20,
    fontWeight: '600',
  },
  selected: {
    backgroundColor: Typography.colors.emerald,
    color: Typography.colors.white,
    // textDecorationLine: 'underline',
    paddingHorizontal: 10,
    paddingVertical: 2.5,
  },
  deselected: {
    paddingHorizontal: 10,
    paddingVertical: 2.5,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {padding: 10, marginRight: 'auto'},
  optionValue: {padding: 10},
});

export default ConfigEditor;

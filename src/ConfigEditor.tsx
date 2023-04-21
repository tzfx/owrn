import React, {useState} from 'react';
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

  return (
    <View style={style}>
      <Pressable onPress={() => setEditting(true)}>
        <Text style={{fontSize: Typography.fontsize.xl}}>≡</Text>
      </Pressable>
      <Modal
        animationType="slide"
        visible={editting}
        onDismiss={() => setEditting(false)}>
        <SafeAreaView>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Speed Unit</Text>
            {['MPH', 'KPH'].map(unit => (
              <Pressable key={unit} style={{padding: 10}}>
                <Text
                  style={
                    config?.speedUnit === unit
                      ? {textDecorationLine: 'underline'}
                      : {}
                  }>
                  {unit}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Temperature Unit</Text>
            {['F', 'C', 'K'].map(unit => (
              <Pressable key={unit}>
                <Text>{unit}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Theme</Text>
            {['light', 'dark', 'system'].map(theme => (
              <Pressable key={theme}>
                <Text>{theme}</Text>
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
          <Button title="Close" onPress={() => setEditting(false)} />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  optionRow: {flexDirection: 'row', alignItems: 'center'},
  optionLabel: {padding: 10},
  optionValue: {padding: 10},
});

export default ConfigEditor;

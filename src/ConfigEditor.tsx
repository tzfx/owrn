import React, {useState} from 'react';
import {
  Button,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {
  AppConfig,
  SavedBoard,
  SpeedUnit,
  StorageService,
  TemperatureUnit,
  ThemeOption,
} from './StorageService';
import {Typography} from './Typography';

type Props = {
  config: AppConfig;
  handleConfigUpdate: (config: AppConfig) => void;
  style?: any;
};

const ConfigEditor = ({config, handleConfigUpdate, style}: Props) => {
  const [editting, setEditting] = useState(false);
  const [debug, setDebug] = useState(config.debug);
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>(config.speedUnit);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>(
    config.temperatureUnit,
  );
  const [theme, setTheme] = useState<ThemeOption>(config.theme);
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([]);

  StorageService.getSavedBoards().then(boards => setSavedBoards(boards));

  return (
    <View style={{...styles.boxed, ...style}}>
      <Pressable onPress={() => setEditting(true)}>
        <Text style={{fontSize: Typography.fontsize.xl}}>≡</Text>
      </Pressable>
      <Modal animationType="slide" visible={editting}>
        <SafeAreaView style={styles.boxed}>
          <Text style={styles.h1}>User Options</Text>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Speed Unit</Text>
            {['KPH', 'MPH'].map(unit => (
              <Pressable
                key={unit}
                style={styles.optionValue}
                onPress={() => {
                  setSpeedUnit(unit as SpeedUnit);
                }}>
                <Text
                  style={
                    speedUnit === unit
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
                  setTemperatureUnit(unit as any);
                }}
                style={styles.optionValue}>
                <Text
                  style={
                    temperatureUnit === unit
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
            {['light', 'dark', 'system'].map(option => (
              <Pressable
                key={option}
                // Until we actually get this working...
                disabled={true}
                onPress={() => {
                  setTheme(option as any);
                }}
                style={styles.optionValue}>
                <Text
                  style={
                    option === theme
                      ? {...styles.selected}
                      : {...styles.deselected}
                  }>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Debug</Text>
            <Switch
              value={debug}
              onValueChange={value => {
                setDebug(value);
              }}
            />
          </View>
          <View>
            <Text style={styles.optionLabel}>Saved Boards</Text>
            {savedBoards.length > 0 ? (
              <FlatList
                data={savedBoards}
                renderItem={({item}) => (
                  <View style={{flexDirection: 'row'}}>
                    <Text>
                      {[
                        item.name,
                        item.id.split(/.{4}-.{23}/).join('...'),
                        item.autoconnect ? '🔗' : '',
                      ].join(' : ')}
                    </Text>
                    <Button
                      title="Delete"
                      color={'red'}
                      onPress={() =>
                        StorageService.removeBoard(item.id).then(() =>
                          setSavedBoards(
                            savedBoards.filter(b => b.id !== item.id),
                          ),
                        )
                      }
                    />
                  </View>
                )}
                keyExtractor={item => item.id}
              />
            ) : (
              <Text>No saved boards.</Text>
            )}
          </View>
          <Button
            color={Typography.colors.emerald}
            title="Done"
            onPress={() => {
              setEditting(false);
              handleConfigUpdate({
                autoconnect: savedBoards.map(b => b.id),
                debug,
                speedUnit,
                theme,
                temperatureUnit,
              });
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  boxed: {marginHorizontal: 30},
  h1: {
    fontSize: Typography.fontsize.medium,
    paddingBottom: 20,
    fontWeight: '600',
  },
  selected: {
    backgroundColor: Typography.colors.emerald,
    color: Typography.colors.white,
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

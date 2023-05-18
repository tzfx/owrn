import * as React from 'react';

import {PeripheralInfo} from 'react-native-ble-manager';

import {STOCK_WHEEL_SIZES, SavedBoard, StorageService} from './StorageService';
import {useEffect, useState} from 'react';
import {Typography} from './Typography';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Generation2Name} from './util/board';

type Props = {
  connectedDevice?: PeripheralInfo;
  board?: SavedBoard;
  handleSave: (updated: SavedBoard) => {};
};

const BoardHeader = ({connectedDevice, board, handleSave}: Props) => {
  const [autoconnect, setAutoconnect] = useState(board?.autoconnect ?? false);
  const [editting, setEditting] = useState(false);
  const [formBoardname, setFormBoardname] = useState(board?.name);
  const [formWheelsize, setFormWheelsize] = useState(board?.wheelSize ?? 10.5);

  const generationName = Generation2Name[board?.generation ?? 5];

  async function saveBoard(id: string, newAutoconnect: boolean = autoconnect) {
    const updated: SavedBoard = {
      id,
      name: formBoardname ?? id,
      generation: board?.generation ?? 5,
      autoconnect: newAutoconnect,
      wheelSize: +(formWheelsize ?? STOCK_WHEEL_SIZES[board?.generation ?? 5]),
    };
    await StorageService.saveBoard(updated);
    return handleSave(updated);
  }

  useEffect(() => {
    if (board != null) {
      setAutoconnect(board.autoconnect);
      setFormBoardname(board.name);
      setFormWheelsize(board.wheelSize);
    }
  }, [board]);

  return (
    <View>
      <Modal animationType="slide" visible={editting}>
        <SafeAreaView style={styles.modalContainer}>
          <View>
            <Text
              style={{
                fontSize: Typography.fontsize.medium,
                fontWeight: '600',
              }}>
              Board Configuration
            </Text>
          </View>
          <View style={styles.modalInput}>
            <Text style={styles.modalInputLabel}>Board Name</Text>
            <TextInput
              style={styles.modalInputBox}
              value={formBoardname}
              placeholder={connectedDevice?.name}
              onChangeText={value => setFormBoardname(value)}
            />

            <Text style={styles.modalInputLabel}>Wheel Size (in.)</Text>
            <TextInput
              style={styles.modalInputBox}
              value={'' + formWheelsize}
              inputMode="decimal"
              keyboardType="decimal-pad"
              onChangeText={value => setFormWheelsize(+value)}
            />
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Autoconnect</Text>
              <Switch
                onValueChange={value => {
                  setAutoconnect(value);
                  saveBoard(connectedDevice!.id, value).then(() => {});
                }}
                value={autoconnect}
              />
            </View>
            <View
              style={{
                width: '100%',
                borderBottomWidth: StyleSheet.hairlineWidth,
                marginVertical: 20,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                width: '100%',
              }}>
              <Pressable
                onPress={() => setEditting(false)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}>
                <Text style={{color: Typography.colors.davys_grey}}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (connectedDevice) {
                    saveBoard(connectedDevice.id).finally(() =>
                      setEditting(false),
                    );
                  }
                }}
                style={{
                  backgroundColor: Typography.colors.emerald,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  marginLeft: 10,
                }}>
                <Text style={{color: Typography.colors.white}}>Save</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
      <View style={styles.nameContainer}>
        <Pressable
          style={{
            flexDirection: 'row',
            backgroundColor: Typography.colors.emerald,
            width: '100%',
            alignItems: 'center',
            paddingVertical: 10,
          }}
          onPress={() => setEditting(true)}>
          <Text
            style={{
              flex: 3,
              textAlign: 'center',
              color: Typography.colors.white,
              fontSize: Typography.fontsize.medium,
            }}>
            {board?.name ?? connectedDevice?.name ?? connectedDevice?.id}
          </Text>
          <Text style={{flex: 1, fontStyle: 'italic', fontWeight: 'bold'}}>
            {generationName.length === 2
              ? generationName
              : generationName.toLocaleLowerCase()}
          </Text>
          <Text style={{flex: 1, fontSize: Typography.fontsize.medium}}>⚙</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default BoardHeader;

const styles = StyleSheet.create({
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  boardName: {
    fontSize: Typography.fontsize.medium * 1.5,
    flex: 2,
  },
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  modalContainer: {
    margin: 30,
    flexDirection: 'column',
    height: '100%',
  },
  modalInput: {
    backgroundColor: Typography.colors.white,
    marginHorizontal: 0,
    padding: 30,
    width: '100%',
  },
  modalInputLabel: {
    paddingTop: 10,
  },
  modalInputBox: {
    borderWidth: StyleSheet.hairlineWidth,
    height: 40,
    padding: 5,
  },
  switchContainer: {
    marginTop: 10,
    marginHorizontal: 100,
    width: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  switchLabel: {
    paddingRight: 10,
  },
});

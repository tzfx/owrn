import * as React from 'react';

import {PeripheralInfo} from 'react-native-ble-manager';

import {SavedBoard, StorageService} from './StorageService';
import {useEffect, useState} from 'react';
import {Typography} from './Typography';
import {
  Button,
  Modal,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

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

  async function saveBoard(id: string, newAutoconnect: boolean = autoconnect) {
    const updated = {
      id,
      name: formBoardname ?? id,
      autoconnect: newAutoconnect,
      wheelSize: +(formWheelsize ?? 10.5),
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
            <View style={styles.flexRow}>
              <Button
                color={'grey'}
                title="Cancel"
                onPress={() => setEditting(false)}
              />
              <Button
                title="Save"
                color={Typography.colors.emerald}
                onPress={() => {
                  if (connectedDevice) {
                    saveBoard(connectedDevice.id).finally(() =>
                      setEditting(false),
                    );
                  }
                }}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
      <View style={styles.switchContainer}>
        <View style={styles.editIcon}>
          <Button title="✏️" onPress={() => setEditting(true)} />
        </View>
        <Text style={styles.boardName}>
          {board?.name ?? connectedDevice?.name ?? connectedDevice?.id}
        </Text>
      </View>
    </View>
  );
};

export default BoardHeader;

const styles = StyleSheet.create({
  boardName: {
    fontSize: Typography.fontsize.large,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 500,
    marginTop: -25,
  },
  editIcon: {top: -15, marginLeft: '-25%'},
  flexRow: {
    flexDirection: 'row',
  },
  modalContainer: {
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

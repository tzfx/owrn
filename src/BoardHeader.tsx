import * as React from 'react';

import {PeripheralInfo} from 'react-native-ble-manager';

import {SavedBoard, StorageService} from './StorageService';
import {useState} from 'react';
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
  handleSave: () => {};
};

const BoardHeader = ({connectedDevice, board, handleSave}: Props) => {
  const [autoconnect, setAutoconnect] = useState(board?.autoconnect ?? false);
  const [editting, setEditting] = useState(false);
  const [formBoardname, setFormBoardname] = useState(board?.name);
  const [formWheelsize, setFormWheelsize] = useState(board?.wheelSize);

  async function saveBoard(id: string) {
    await StorageService.saveBoard({
      id,
      name: formBoardname ?? id,
      autoconnect,
      wheelSize: +(formWheelsize ?? 10.5),
    });
    return handleSave();
  }

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
            <View style={styles.flexRow}>
              <Button
                color={'grey'}
                title="Cancel"
                onPress={() => setEditting(false)}
              />
              <Button
                title="Save"
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
      <View style={styles.flexRow}>
        <View style={styles.editIcon}>
          <Button title="✏️" onPress={() => setEditting(true)} />
        </View>
        <Text style={styles.boardName}>
          {board?.name ?? connectedDevice?.name ?? connectedDevice?.id}
        </Text>
      </View>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Autoconnect</Text>
        <Switch
          onValueChange={value => {
            setAutoconnect(value);
            saveBoard(connectedDevice!.id);
          }}
          value={autoconnect}
        />
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
    marginTop: -25,
  },
  editIcon: {top: -20, marginLeft: '-25%'},
  flexRow: {
    flexDirection: 'row',
  },
  modalContainer: {
    alignItems: 'center',
    backgroundColor: Typography.colors.emerald,
    flexDirection: 'column',
    height: '100%',
  },
  modalInput: {
    backgroundColor: Typography.colors.white,
    fontSize: Typography.fontsize.medium,
    marginHorizontal: 0,
    padding: 30,
    width: '100%',
  },
  modalInputLabel: {
    fontSize: Typography.fontsize.medium,
    paddingTop: 10,
  },
  modalInputBox: {
    borderWidth: 0.5,
    height: 40,
    padding: 5,
  },
  switchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  switchLabel: {
    fontSize: Typography.fontsize.small,
    paddingRight: 10,
  },
});

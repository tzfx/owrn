import React, {Component} from 'react';
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
import {PeripheralInfo} from 'react-native-ble-manager';

import {SavedBoard, StorageService} from './StorageService';
import {Typography} from './Typography';

type Props = {
  connectedDevice?: PeripheralInfo;
  board?: SavedBoard;
  handleSave: () => {};
};

type State = {
  autoconnect: boolean;
  editting: boolean;
  boardName?: string;
  tempBoardName?: string;
  tempWheelSize?: string;
};

class BoardHeader extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      autoconnect: props.board?.autoconnect ?? false,
      editting: false,
      boardName: props.board?.name,
      tempBoardName: props.board?.name,
      tempWheelSize: props.board?.wheelSize.toString(),
    };
  }
  private async saveConnection(id: string) {
    await StorageService.saveBoard({
      id,
      name: this.state.tempBoardName ?? id,
      autoconnect: this.state.autoconnect,
      wheelSize: +(this.state.tempWheelSize ?? 10.5),
    });
    return this.props.handleSave();
  }

  private async deleteConnection(id: string) {
    return await StorageService.removeBoard(id);
  }
  render() {
    return (
      <View>
        <Modal visible={this.state.editting}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalInput}>
              <Text style={styles.modalInputLabel}>Board Name</Text>
              <TextInput
                style={styles.modalInputBox}
                value={this.state.tempBoardName}
                placeholder={this.props.connectedDevice?.name}
                onChangeText={tempBoardName => {
                  this.setState({tempBoardName});
                }}
              />

              <Text style={styles.modalInputLabel}>Wheel Size (in.)</Text>
              <TextInput
                style={styles.modalInputBox}
                value={this.state.tempWheelSize}
                inputMode="decimal"
                keyboardType="decimal-pad"
                onChangeText={tempWheelSize => {
                  this.setState({tempWheelSize});
                }}
              />
              <View style={{...styles.flexRow}}>
                <Button
                  color={'grey'}
                  title="Cancel"
                  onPress={() => this.setState({editting: false})}
                />
                <Button
                  title="Save"
                  onPress={() => {
                    if (this.props.connectedDevice) {
                      this.saveConnection(
                        this.props.connectedDevice.id,
                      ).finally(() =>
                        this.setState({
                          editting: false,
                        }),
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
            <Button
              title="✏️"
              onPress={() => this.setState({editting: true})}
            />
          </View>
          <Text style={{...styles.boardName}}>
            {this.props.board?.name ??
              this.props.connectedDevice?.name ??
              this.props.connectedDevice?.id}
          </Text>
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Autoconnect</Text>
          <Switch
            onValueChange={autoconnect => {
              this.setState({autoconnect}, () => {
                this.saveConnection(this.props.connectedDevice!.id);
              });
            }}
            value={this.state.autoconnect}
          />
        </View>
      </View>
    );
  }
}

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
    fontSize: Typography.fontsize.medium,
    paddingRight: 10,
  },
});

export default BoardHeader;

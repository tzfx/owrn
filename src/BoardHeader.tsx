import React, {Component} from 'react';
import {PeripheralInfo} from 'react-native-ble-manager';
import {
  Button,
  Modal,
  SafeAreaView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {SavedBoard, StorageService} from './StorageService';

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
          <SafeAreaView
            style={{
              backgroundColor: '#56bf81',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                width: '100%',
                padding: 30,
                marginHorizontal: 0,
              }}>
              <Text style={{fontSize: 20}}>Board Name</Text>
              <TextInput
                style={{
                  height: 40,
                  margin: 0,
                  borderWidth: 0.5,
                  marginTop: 10,
                  padding: 5,
                }}
                value={this.state.tempBoardName}
                placeholder={this.props.connectedDevice?.name}
                onChangeText={tempBoardName => {
                  this.setState({tempBoardName});
                }}
              />

              <Text style={{fontSize: 20, paddingTop: 10}}>
                Wheel Size (in.)
              </Text>
              <TextInput
                style={{
                  height: 40,
                  margin: 0,
                  borderWidth: 1,
                  marginTop: 10,
                  padding: 5,
                }}
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
        <View
          style={{
            flexDirection: 'row',
          }}>
          <View style={{top: -20, marginLeft: '-25%'}}>
            <Button
              title="✏️"
              onPress={() => this.setState({editting: true})}
            />
          </View>
          <Text style={{...styles.boardName}}>
            {this.state.boardName ??
              this.props.connectedDevice?.name ??
              this.props.connectedDevice?.id}
          </Text>
        </View>
        <View style={{...styles.switchContainer}}>
          <Text
            style={{
              ...styles.switchLabel,
            }}>
            Autoconnect
          </Text>
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

const styles = {
  boardName: {
    fontSize: 36,
    marginTop: -25,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 20,
    paddingRight: 10,
  },
  flexRow: {
    flexDirection: 'row',
  },
};

export default BoardHeader;

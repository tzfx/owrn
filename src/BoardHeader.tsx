import React, {Component} from 'react';
import {PeripheralInfo} from 'react-native-ble-manager';
import {Button, Modal, Switch, Text, TextInput, View} from 'react-native';

import {SavedBoard, StorageService} from './StorageService';

type Props = {
  connectedDevice?: PeripheralInfo;
  autoconnect: boolean;
  board?: SavedBoard;
};

type State = {
  autoconnect: boolean;
  edittingName: boolean;
  boardName?: string;
  tempBoardName?: string;
};

class BoardHeader extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      autoconnect: props.autoconnect,
      edittingName: false,
      boardName: this.props.board?.name ?? undefined,
      tempBoardName: this.props.board?.name ?? undefined,
    };
  }
  private async saveConnection(id: string, name?: string) {
    return await StorageService.saveBoard({
      id,
      name: name ?? id,
      autoconnect: this.state.autoconnect,
    });
  }

  private async deleteConnection(id: string) {
    return await StorageService.removeBoard(id);
  }
  render() {
    return (
      <View>
        <Modal visible={this.state.edittingName}>
          <View
            style={{
              padding: 100,
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <Text style={{fontSize: 20}}>Rename your board</Text>
            <TextInput
              style={{
                height: 40,
                margin: 0,
                borderWidth: 1,
                marginTop: 10,
                paddingVertical: 5,
                paddingHorizontal: 50,
              }}
              value={this.state.tempBoardName}
              placeholder={this.props.connectedDevice?.name}
              onChangeText={tempBoardName => {
                this.setState({tempBoardName});
              }}
            />
            <View style={{...styles.flexRow}}>
              <Button
                color={'grey'}
                title="Cancel"
                onPress={() => this.setState({edittingName: false})}
              />
              <Button
                title="Save"
                onPress={() => {
                  if (this.props.connectedDevice) {
                    this.saveConnection(
                      this.props.connectedDevice.id,
                      this.state.tempBoardName,
                    ).finally(() =>
                      this.setState({
                        boardName: this.state.tempBoardName,
                        edittingName: false,
                      }),
                    );
                  }
                }}
              />
            </View>
          </View>
        </Modal>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <View style={{top: -20, marginLeft: '-25%'}}>
            <Button
              title="✏️"
              onPress={() => this.setState({edittingName: true})}
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
            onValueChange={autoconnect =>
              (autoconnect
                ? this.saveConnection(
                    this.props.connectedDevice!.id,
                    this.state.boardName,
                  )
                : this.deleteConnection(this.props.connectedDevice!.id)
              ).then(() => this.setState({autoconnect}))
            }
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

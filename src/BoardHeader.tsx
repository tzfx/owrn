import React, {Component} from 'react';
import {PeripheralInfo} from 'react-native-ble-manager';
import {Button, Modal, Switch, Text, TextInput, View} from 'react-native';

import {StorageService} from './StorageService';

type Props = {
  connectedDevice?: PeripheralInfo;
  autoconnect: boolean;
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
    this.state = {autoconnect: props.autoconnect, edittingName: false};
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
        <Button
          title="✏️"
          onPress={() => this.setState({edittingName: true})}
        />
        <Modal visible={this.state.edittingName}>
          <Text>Name your board:</Text>
          <TextInput
            value={this.state.tempBoardName}
            placeholder={this.props.connectedDevice?.name}
            onEndEditing={e =>
              this.setState({tempBoardName: e.target.toString()})
            }
          />
          <Button
            title="Save"
            onPress={() => {
              if (this.props.connectedDevice) {
                this.saveConnection(
                  this.props.connectedDevice.id,
                  this.state.boardName,
                );
              }
            }}
          />
          <Button
            title="Cancel"
            onPress={() => this.setState({edittingName: false})}
          />
        </Modal>
        <Text style={{...styles.boardName}}>
          {this.state.boardName ??
            this.props.connectedDevice?.name ??
            this.props.connectedDevice?.id}
        </Text>
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
};

export default BoardHeader;

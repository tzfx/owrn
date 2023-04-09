import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component} from 'react';
import {PeripheralInfo} from 'react-native-ble-manager';
import {Switch, Text, View} from 'react-native';

type Props = {
  connectedDevice?: PeripheralInfo;
  autoconnect: boolean;
};

type State = {
  autoconnect: boolean;
};

class BoardHeader extends Component<Props, State> {
  private readonly storageid_savedboard = 'owrn-saved-board';

  constructor(props: Props) {
    super(props);
    this.state = {autoconnect: props.autoconnect};
  }
  private async saveConnection(id?: string) {
    if (id != null) {
      await AsyncStorage.setItem(this.storageid_savedboard, id);
    } else {
      await AsyncStorage.removeItem(this.storageid_savedboard);
    }
  }
  render() {
    return (
      <View>
        <Text style={{...styles.boardName}}>
          {this.props.connectedDevice?.name ?? this.props.connectedDevice?.id}
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
              this.saveConnection(
                autoconnect ? this.props.connectedDevice?.id : undefined,
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

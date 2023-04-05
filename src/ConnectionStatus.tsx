import React, {Component} from 'react';

import {Text, type TextStyle} from 'react-native';
import {type ConnectionState, getEmoji} from './ConnectionState';

interface Props {
  style?: TextStyle;
  status: ConnectionState;
}

class ConnectionStatus extends Component<Props> {
  render(): JSX.Element {
    return <Text style={this.props.style}>{getEmoji(this.props.status)}</Text>;
  }
}

export default ConnectionStatus;

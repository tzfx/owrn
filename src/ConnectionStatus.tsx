import React from 'react';

import {Text, type TextStyle} from 'react-native';
import {getEmoji, type ConnectionState} from './ConnectionState';

interface Props {
  style?: TextStyle;
  status: ConnectionState;
}

const ConnectionStatus = ({style, status}: Props) => {
  return <Text style={style}>{getEmoji(status)}</Text>;
};

export default ConnectionStatus;

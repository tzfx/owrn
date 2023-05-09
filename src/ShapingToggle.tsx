import React from 'react';
import {View, Button, Text, StyleSheet} from 'react-native';
import {Typography} from './Typography';
import {ShapingOptionName, SHAPING_LIMITS} from './CustomShaping';

type ShapingOption = {
  name: ShapingOptionName;
  colors: {up: string; down: string};
};

type Props = {
  option: ShapingOption;
  value: number;
  handleModifier: (name: ShapingOptionName, by: number) => {};
};

const ShapingToggle = ({option, value, handleModifier}: Props) => {
  return (
    <View style={style.flexcol}>
      <Text>
        {option.name} : {value}
      </Text>
      <View
        style={{
          ...style.button,
          backgroundColor: option.colors.up,
        }}>
        <Button
          disabled={value === SHAPING_LIMITS.max}
          color={Typography.colors.white}
          title="MORE"
          onPress={() => handleModifier(option.name, 1)}
        />
      </View>
      <View
        style={{
          ...style.button,
          backgroundColor: option.colors.down,
        }}>
        <Button
          disabled={value === SHAPING_LIMITS.min}
          color={Typography.colors.white}
          title="LESS"
          onPress={() => handleModifier(option.name, -1)}
        />
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  flexcol: {flex: 1, flexDirection: 'column'},
  button: {
    paddingVertical: 5,
    marginHorizontal: 2,
  },
});

export default ShapingToggle;

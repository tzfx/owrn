import React from 'react';
import {View, Button, Text, StyleSheet} from 'react-native';
import {Typography} from './Typography';
import {ShapingOptionName, ShapingOption} from './CustomShaping';

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
          disabled={value === option.limits.max}
          color={Typography.colors.white}
          title="MORE"
          onPress={() => handleModifier(option.name, option.limits.step)}
        />
      </View>
      <View
        style={{
          ...style.button,
          backgroundColor: option.colors.down,
        }}>
        <Button
          disabled={value === option.limits.min}
          color={Typography.colors.white}
          title="LESS"
          onPress={() => handleModifier(option.name, -1 * option.limits.step)}
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

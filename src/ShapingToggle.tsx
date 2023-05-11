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
    <View
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        ...style.flexcol,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderColor: option.colors.label,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: option.colors.label,
      }}>
      <Text style={{marginVertical: 10}}>
        {option.emoji ?? option.name} : {value}
      </Text>
      <View
        style={{
          ...style.button,
          backgroundColor: option.colors.up,
        }}>
        <Button
          disabled={value === option.limits.max}
          color={Typography.colors.white}
          title="＋"
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
          title="−"
          onPress={() => handleModifier(option.name, -1 * option.limits.step)}
        />
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  flexcol: {flex: 1, flexDirection: 'column', alignItems: 'center'},
  button: {
    width: '100%',
    paddingVertical: 5,
    marginHorizontal: 5,
  },
});

export default ShapingToggle;

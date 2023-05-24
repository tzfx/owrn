import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
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
      style={{
        ...style.flexcol,
        marginTop: 5,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderColor: option.colors.label,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: option.colors.label,
      }}>
      <Text style={{marginVertical: 15}}>
        {option.emoji ?? option.name} : {value}
      </Text>
      <Pressable
        style={({pressed}) => ({
          width: '100%',
          paddingVertical: 10,
          backgroundColor:
            pressed || value === option.limits.max
              ? option.colors.label
              : option.colors.up,
        })}
        disabled={value === option.limits.max}
        onPress={() => handleModifier(option.name, option.limits.step)}>
        <Text
          style={{
            color: Typography.colors.white,
            textAlign: 'center',
            fontSize: Typography.fontsize.medium,
          }}>
          ＋
        </Text>
      </Pressable>
      <Pressable
        style={({pressed}) => ({
          width: '100%',
          paddingVertical: 10,
          backgroundColor:
            pressed || value === option.limits.min
              ? option.colors.label
              : option.colors.down,
        })}
        disabled={value === option.limits.min}
        onPress={() => handleModifier(option.name, -1 * option.limits.step)}>
        <Text
          style={{
            color: Typography.colors.white,
            textAlign: 'center',
            fontSize: Typography.fontsize.medium,
          }}>
          −
        </Text>
      </Pressable>
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

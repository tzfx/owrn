import React, {useState} from 'react';
import {Button, Text, View} from 'react-native';
import {Typography} from './Typography';

const shapingLimits = {
  min: 0,
  max: 10,
};

type ShapingOptionName = 'fire' | 'flow' | 'tilt';

const shapingOptions: {
  name: ShapingOptionName;
  colors: {up: string; down: string};
}[] = [
  {name: 'fire', colors: {up: '#e45221', down: '#8e452c'}},
  {name: 'flow', colors: {up: '#9DC6E1', down: '#6a8596'}},
  {name: 'tilt', colors: {up: '#000', down: 'grey'}},
];

const CustomShaping = () => {
  const [fire, setFire] = useState(0);
  const [flow, setFlow] = useState(0);
  const [tilt, setTilt] = useState(0);

  async function handleModifier(option: ShapingOptionName, modifier: number) {
    switch (option) {
      case 'fire':
        setFire(fire + modifier);
        break;
      case 'flow':
        setFlow(flow + modifier);
        break;
      case 'tilt':
        setTilt(tilt + modifier);
        break;
    }
  }

  //   async function handleFire(modifier: number) {
  //     setFire(fire + modifier);
  //   }

  //   async function handleFlow(modifier: number) {
  //     setFlow(flow + modifier);
  //   }

  return (
    <View style={{flexDirection: 'row', width: '100%'}}>
      {shapingOptions.map(({name, colors}) => (
        <View style={{flex: 1, flexDirection: 'column'}}>
          <Text>{name}</Text>
          <View
            style={{
              paddingVertical: 5,
              marginHorizontal: 2,
              backgroundColor: colors.up,
            }}>
            <Button
              disabled={fire === shapingLimits.max}
              color={Typography.colors.white}
              title="MORE"
              onPress={() => handleModifier(name, 1)}
            />
          </View>
          <View
            style={{
              paddingVertical: 5,
              marginHorizontal: 2,
              backgroundColor: colors.down,
            }}>
            <Button
              disabled={fire === shapingLimits.min}
              color={Typography.colors.white}
              title="LESS"
              onPress={() => handleModifier(name, -1)}
            />
          </View>
        </View>
      ))}
      {/* <View style={{flex: 1, flexDirection: 'column'}}>
        <Text>Fire ({fire})</Text>
        <View
          style={{
            paddingVertical: 5,
            marginHorizontal: 2,
            backgroundColor: '#e45221',
          }}>
          <Button
            disabled={fire === shapingLimits.max}
            color={Typography.colors.white}
            title="MORE"
            onPress={() => handleFire(1)}
          />
        </View>
        <View
          style={{
            paddingVertical: 5,
            marginHorizontal: 2,
            backgroundColor: '#8e452c',
          }}>
          <Button
            disabled={fire === shapingLimits.min}
            color={Typography.colors.white}
            title="LESS"
            onPress={() => handleFire(-1)}
          />
        </View>
      </View>
      <View style={{flex: 1, flexDirection: 'column'}}>
        <Text>Flow ({flow})</Text>
        <View
          style={{
            paddingVertical: 5,
            marginHorizontal: 2,
            backgroundColor: '#9DC6E1',
          }}>
          <Button
            color={Typography.colors.white}
            title="MORE"
            onPress={() => handleFlow(1)}
          />
        </View>
        <View
          style={{
            paddingVertical: 5,
            marginHorizontal: 2,
            backgroundColor: '#6a8596',
          }}>
          <Button
            color={Typography.colors.white}
            title="LESS"
            onPress={() => handleFlow(-1)}
          />
        </View>
      </View> */}
    </View>
  );
};

export default CustomShaping;

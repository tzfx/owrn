import {StyleSheet} from 'react-native';

const Typography = {
  nativeFonts:
    '-apple-system, ".SFNSText-Regular", "San Francisco", "Roboto", "Segoe UI", "Helvetica Neue", "Lucida Grande", sans-serif',
  colors: {
    black: '#000',
    jet: '#454241',
    davys_grey: '#54504e',
    taupe: '#534741',
    viridian: '#558361',
    emerald: '#56bf81',
    celadon: '#80cfa0',
    white: '#fff',
  },
  fontsize: {
    small: 16,
    medium: 20,
    large: 36,
    xl: 48,
    xxl: 64,
  },
  emptyFlex: {flex: 1},
};

const Themes = StyleSheet.create({
  dark: {
    color: Typography.colors.white,
    backgroundColor: Typography.colors.black,
  },
  light: {
    color: Typography.colors.black,
    backgroundColor: Typography.colors.white,
  },
});

export {Typography, Themes};

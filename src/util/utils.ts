import {inferBoardFromFirmwareRevision} from './board';

export function* chunks<T>(arr: T[], n: number) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

export const sleep = (milliseconds: number) => {
  return new Promise((resolve: any) => setTimeout(resolve, milliseconds));
};

// export const typedArraysAreEqual = (a: any, b: any) => {
//   if (a.byteLength !== b.byteLength) return false;
//   return a.every((val, i) => val === b[i]);
// };

export const toDisplayName = (text: string) =>
  text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => {
      return str.toUpperCase();
    })
    .replace(/([A-Z])\s(?=[A-Z]\b)/g, '$1');

// export const pascalCase = (str: string) =>
//   camelCase(str).replace(/^(.)/, toUpper);

export const rescale = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
) => {
  return toMin + ((toMax - toMin) / (fromMax - fromMin)) * (value - fromMin);
};

export const inferBoardFromUpdateFile = (filename: string) => {
  const key = 'encryptedfw';
  const firmwareRevision = filename
    .substring(filename.indexOf(key) + key.length)
    .replace('.bin', '');
  return inferBoardFromFirmwareRevision(parseInt(firmwareRevision));
};

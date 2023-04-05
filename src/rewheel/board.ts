export const BoardGeneration = {
  V1: 1,
  V1_2: 2,
  Plus: 3,
  XR: 4,
  Pint: 5,
  GT: 6,
  PintX: 7,
};

export type BoardGenerationName =
  | 'V1'
  | 'V1_2'
  | 'Plus'
  | 'XR'
  | 'Pint'
  | 'GT'
  | 'PintX';

export const allGenerations = Object.values(BoardGeneration);

export const inferBoardFromFirmwareRevision = (revision: number) => {
  const generation = Math.floor(revision / 1000);
  const subrevision = revision % 1000;

  if (generation === 5 && subrevision > 70) {
    return Object.keys(BoardGeneration)[generation + 2 - 1];
  }

  return Object.keys(BoardGeneration)[generation - 1];
};

export const getRevisionInformation = (revision: number) => {
  const ones = Math.floor(revision % 10);
  const tens = Math.floor((revision / 10) % 10);
  const hundreds = Math.floor((revision / 100) % 10);
  const thousands = Math.floor((revision / 1000) % 10);

  return {
    major: thousands,
    minor: hundreds,
    patch: hundreds * 100 + tens * 10 + ones,
  };
};

export const inferBoardFromHardwareRevision = (revision: number) => {
  const generation = Math.floor(revision / 1000);

  return Object.keys(BoardGeneration)[generation - 1];
};

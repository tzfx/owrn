import AsyncStorage from '@react-native-async-storage/async-storage';

const prefix = 'owrn-app';
const prefix_savedboards = prefix + '-savedboard#';

export const wheelSizes = {
  'Stock XR+ (11.5)': 11.5,
  'TFL/Burris/Hoosier (11)': 11,
  'Stock Pint (10.5)': 10.5,
};

export type SavedBoard = {
  id: string;
  name: string;
  autoconnect: boolean;
  wheelSize: number;
};

export interface IStorageService {
  getSavedBoards: () => Promise<SavedBoard[]>;
  getBoard: (id: string) => Promise<SavedBoard>;
  saveBoard: (board: SavedBoard) => Promise<void>;
  removeBoard: (id: string) => Promise<void>;
}

const reviveBoard: (dry: string) => SavedBoard = dry => {
  const {id, name, autoconnect, wheelSize} = JSON.parse(dry);
  return {
    id,
    name,
    autoconnect,
    wheelSize,
  };
};

const StorageService: IStorageService = {
  getSavedBoards: () => {
    return AsyncStorage.getAllKeys()
      .then(keys => keys.filter(k => k.startsWith(prefix_savedboards)))
      .then(keys => AsyncStorage.multiGet(keys))
      .then(boards => boards.map(([_, v]) => reviveBoard(v as string)));
  },
  getBoard: function (id: string): Promise<SavedBoard> {
    return AsyncStorage.getItem(prefix_savedboards + id).then(v => {
      if (v == null) {
        throw new Error(`Unable to retrieve board ${id}`);
      }
      return reviveBoard(v);
    });
  },
  saveBoard: function (board: SavedBoard): Promise<void> {
    return AsyncStorage.setItem(
      prefix_savedboards + board.id,
      JSON.stringify(board),
    );
  },
  removeBoard: function (id: string): Promise<void> {
    return AsyncStorage.removeItem(prefix_savedboards + id);
  },
};

export {StorageService};

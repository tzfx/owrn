import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'owrn-app';
const PREFIX_APP_CONFIG = PREFIX + '-appconfig';
const PREFIX_SAVEDBOARDS = PREFIX + '-savedboard#';

export const WHEEL_SIZES = {
  'Stock XR+ (11.5)': 11.5,
  'TFL/Burris/Hoosier (11)': 11,
  'Stock Pint (10.5)': 10.5,
};

export type SavedBoard = {
  id: string;
  name: string;
  autoconnect: boolean;
  wheelSize: number;
  topRPM?: number;
};

export type SpeedUnit = 'MPH' | 'KPH';
export type TemperatureUnit = 'C' | 'F' | 'K';
export type ThemeOption = 'light' | 'dark' | 'system';

export type AppConfig = {
  // A prioritied list of ids to attempt autoconnection.
  autoconnect: string[];
  // Temperature Unit
  temperatureUnit: TemperatureUnit;
  // Speed Unit
  speedUnit: SpeedUnit;
  // Theme setting-- light/dark/defer to system.
  theme: ThemeOption;
  debug: boolean;
};

export interface IStorageService {
  // Configuration
  getAppConfig: () => Promise<AppConfig>;
  updateAppConfig: (update: Partial<AppConfig>) => Promise<AppConfig>;
  // Board Storage
  getSavedBoards: () => Promise<SavedBoard[]>;
  getBoard: (id: string) => Promise<SavedBoard>;
  saveBoard: (board: SavedBoard) => Promise<void>;
  removeBoard: (id: string) => Promise<void>;
}

const reviveBoard: (dry: string) => SavedBoard = dry => {
  const {id, name, autoconnect, topRPM, wheelSize} = JSON.parse(dry);
  return {
    id,
    name,
    autoconnect,
    topRPM,
    wheelSize,
  };
};

const StorageService: IStorageService = {
  getAppConfig: () => {
    return AsyncStorage.getItem(PREFIX_APP_CONFIG).then(config =>
      config != null
        ? JSON.parse(config)
        : ({
            autoconnect: [],
            temperatureUnit: 'F',
            speedUnit: 'MPH',
            theme: 'system',
            debug: false,
          } as AppConfig),
    );
  },
  updateAppConfig: (update: Partial<AppConfig>) => {
    return StorageService.getAppConfig().then(config => {
      if (
        update.autoconnect?.length === 1 &&
        !config.autoconnect.includes(update.autoconnect[0])
      ) {
        update.autoconnect = [update.autoconnect[0], ...config.autoconnect];
      }
      return AsyncStorage.setItem(
        PREFIX_APP_CONFIG,
        JSON.stringify({...config, ...update}),
      ).then(() => config);
    });
  },
  getSavedBoards: () => {
    return AsyncStorage.getAllKeys()
      .then(keys => keys.filter(k => k.startsWith(PREFIX_SAVEDBOARDS)))
      .then(keys => AsyncStorage.multiGet(keys))
      .then(boards => boards.map(([_, v]) => reviveBoard(v as string)));
  },
  getBoard: function (id: string): Promise<SavedBoard> {
    return AsyncStorage.getItem(PREFIX_SAVEDBOARDS + id).then(v => {
      if (v == null) {
        throw new Error(`Unable to retrieve board ${id}`);
      }
      return reviveBoard(v);
    });
  },
  saveBoard: function (board: SavedBoard): Promise<void> {
    return StorageService.getAppConfig()
      .then(({autoconnect}) => {
        const found = autoconnect.includes(board.id);
        let update: string[] = [];
        // Add
        if (board.autoconnect && !found) {
          update = [board.id, ...autoconnect];
        }
        // Remove.
        if (!board.autoconnect && found) {
          update = autoconnect.filter(id => id !== board.id);
        }
        return StorageService.updateAppConfig({autoconnect: update});
      })
      .then(() =>
        AsyncStorage.setItem(
          PREFIX_SAVEDBOARDS + board.id,
          JSON.stringify(board),
        ),
      );
  },
  removeBoard: async function (id: string): Promise<void> {
    await AsyncStorage.removeItem(PREFIX_SAVEDBOARDS + id);
    const {autoconnect} = await StorageService.getAppConfig();
    if (autoconnect.includes(id)) {
      await StorageService.updateAppConfig({
        autoconnect: autoconnect.filter(i => i !== id),
      });
    }
  },
};

export {StorageService};

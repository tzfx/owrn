import AsyncStorage from '@react-native-async-storage/async-storage';
import {SupportedGeneration} from './util/board';

const PREFIX = 'owrn-app';
const PREFIX_APP_CONFIG = PREFIX + '-appconfig';
const PREFIX_SAVEDBOARDS = PREFIX + '-savedboard#';

export const STOCK_WHEEL_SIZES: {
  [generation in SupportedGeneration]: number;
} = {
  4: 11.5, // XR
  5: 10.5, // Pint
  6: 11.5, // GT
  7: 10.5, // PintX
};

export type SavedBoard = {
  // Whether or not to attempt autoconnect.
  autoconnect: boolean;
  // Whether or not to allow custom shaping.
  canUseCustomShaping: boolean;
  // What generation of board we're connected to.
  generation: SupportedGeneration;
  // id
  id: string;
  // User-defined name.
  name: string;
  // Effective top speed.
  topRPM?: number;
  // In inches- Used to calculate speed from RPM.
  wheelSize: number;
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
  // Generate a debug board for deveopment without BT support.
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
  const {
    id,
    name,
    canUseCustomShaping,
    autoconnect,
    topRPM,
    wheelSize,
    generation,
  } = JSON.parse(dry);
  return {
    id,
    canUseCustomShaping,
    generation,
    name,
    autoconnect,
    topRPM,
    wheelSize,
  };
};

const StorageService: IStorageService = {
  getAppConfig: async () => {
    const config = await AsyncStorage.getItem(PREFIX_APP_CONFIG);
    return config != null
      ? JSON.parse(config)
      : ({
          autoconnect: [],
          temperatureUnit: 'F',
          speedUnit: 'MPH',
          theme: 'system',
          debug: false,
        } as AppConfig);
  },
  updateAppConfig: async (update: Partial<AppConfig>) => {
    const config = await StorageService.getAppConfig();
    if (
      update.autoconnect?.length === 1 &&
      !config.autoconnect.includes(update.autoconnect[0])
    ) {
      update.autoconnect = [update.autoconnect[0], ...config.autoconnect];
    }
    await AsyncStorage.setItem(
      PREFIX_APP_CONFIG,
      JSON.stringify({...config, ...update}),
    );
    return config;
  },
  getSavedBoards: async () => {
    const keys = await AsyncStorage.getAllKeys();
    const keys_1 = keys.filter(k => k.startsWith(PREFIX_SAVEDBOARDS));
    const boards = await AsyncStorage.multiGet(keys_1);
    return boards.map(([_, v]) => reviveBoard(v as string));
  },
  getBoard: async function (id: string): Promise<SavedBoard> {
    const v = await AsyncStorage.getItem(PREFIX_SAVEDBOARDS + id);
    if (v == null) {
      throw new Error(`Unable to retrieve board ${id}`);
    }
    return reviveBoard(v);
  },
  saveBoard: async function (board: SavedBoard): Promise<void> {
    const {autoconnect} = await StorageService.getAppConfig();
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
    await StorageService.updateAppConfig({autoconnect: update});
    return await AsyncStorage.setItem(
      PREFIX_SAVEDBOARDS + board.id,
      JSON.stringify(board),
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

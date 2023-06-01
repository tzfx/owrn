import AsyncStorage from '@react-native-async-storage/async-storage';
import {SavedBoard, StorageService} from '../src/StorageService';

beforeEach(() => AsyncStorage.clear());
afterAll(() => AsyncStorage.clear());

describe('StorageService - AppConfig', () => {
  it('should return a default config', async () => {
    const config = await StorageService.getAppConfig();
    expect(config).toEqual({
      autoconnect: [],
      debug: false,
      speedUnit: 'MPH',
      temperatureUnit: 'F',
      theme: 'system',
    });
  });
  it('should save a config update', async () => {
    const config = await StorageService.getAppConfig();
    await StorageService.updateAppConfig({
      speedUnit: 'KPH',
      autoconnect: ['1234'],
    });
    const updated = await StorageService.getAppConfig();
    expect(updated).toEqual({
      ...config,
      speedUnit: 'KPH',
      autoconnect: ['1234'],
    });
  });
  it('should add an id to autoconnect if only one is passed', async () => {
    const config = await StorageService.getAppConfig();
    await StorageService.updateAppConfig({
      speedUnit: 'KPH',
      autoconnect: ['1234'],
    });
    await StorageService.updateAppConfig({
      autoconnect: ['5678'],
    });
    const updated = await StorageService.getAppConfig();
    expect(updated).toEqual({
      ...config,
      speedUnit: 'KPH',
      autoconnect: ['5678', '1234'],
    });
  });
});

describe('StorageService - SavedBoard', () => {
  it('should update the app config when a board autoconnect flag is toggled', async () => {
    const {autoconnect} = await StorageService.getAppConfig();
    expect(autoconnect).toEqual([]);
    const board1: SavedBoard = {
      id: '1',
      name: 'one',
      autoconnect: false,
      wheelSize: 11,
    };
    await StorageService.saveBoard(board1);
    expect(autoconnect).toEqual([]);
    await StorageService.saveBoard({...board1, autoconnect: true});
    const {autoconnect: update1} = await StorageService.getAppConfig();
    expect(update1).toEqual(['1']);
    await StorageService.saveBoard({...board1, autoconnect: false});
    const {autoconnect: update2} = await StorageService.getAppConfig();
    expect(update2).toEqual([]);
  });
  it('should maintain autoconnect order with most recently added as first', async () => {
    const [b1, b2, b3]: SavedBoard[] = Array(3)
      .fill(1)
      .map<SavedBoard>((_, i) => ({
        id: `${i + 1}`,
        name: `board-${i + 1}`,
        wheelSize: 11,
        autoconnect: true,
        canUseCustomShaping: false,
        generation: 5,
      }));
    await [b1, b2, b3].reduce(async (p, c) => {
      await p;
      return StorageService.saveBoard(c);
    }, Promise.resolve());
    const {autoconnect: initial} = await StorageService.getAppConfig();
    expect(initial).toEqual(['3', '2', '1']);
    await StorageService.saveBoard({...b2, autoconnect: false});
    const {autoconnect: update1} = await StorageService.getAppConfig();
    expect(update1).toEqual(['3', '1']);
    await StorageService.saveBoard({...b2, autoconnect: true});
    const {autoconnect: update2} = await StorageService.getAppConfig();
    expect(update2).toEqual(['2', '3', '1']);
  });
});

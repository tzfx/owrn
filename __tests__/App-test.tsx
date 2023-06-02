/* eslint-disable react/react-in-jsx-scope */
import {render, screen, waitFor} from '@testing-library/react-native';
import App from '../src/App';

// Required to get the app loaded.
jest.mock(
  '../node_modules/react-native/Libraries/EventEmitter/NativeEventEmitter',
);
// This mock seems needlessly complicated.
jest.mock('../src/StorageService', () => {
  const auto = jest.createMockFromModule<
    typeof import('../src/StorageService')
  >('../src/StorageService');
  const actual = jest.requireActual('../src/StorageService');
  return {
    ...actual,
    StorageService: {
      ...auto.StorageService,
      getAppConfig: async () => ({
        autoconnect: [],
        temperatureUnit: 'F',
        speedUnit: 'MPH',
        theme: 'system',
        debug: false,
      }),
      getSavedBoards: async () => [],
    },
  };
});
jest.mock('react-native-ble-manager');

describe('App', () => {
  test('renders without crashing', async () => {
    jest.useFakeTimers();
    render(<App />);
    jest.runAllTimers();
    return await waitFor(() => expect(screen.toJSON()).toMatchSnapshot());
  }, 10_000);
});

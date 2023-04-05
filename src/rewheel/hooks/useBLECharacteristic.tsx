// import PQueue from 'p-queue';
import {useContext, useEffect} from 'react';
import {useState} from 'react';
import {OnewheelContext} from '../components/OnewheelProvider';
import {pascalCase} from '../utils';

export const bleQueue = new PQueue({concurrency: 1});

export const useBLECharacteristic = (name, operations) => {
  const {characteristics} = useContext(OnewheelContext);
  const characteristic = characteristics[name];

  const {read, write, notify} = {
    read: false,
    write: false,
    notify: false,
    ...operations,
  };
  const [value, setValue] = useState(null);

  const listener = e => setValue(e.target.value);

  const writeValue = async view => {
    if (write) {
      return await bleQueue.add(() => characteristic.writeValue(view));
    }
    return new Error('"write" not available');
  };

  const readValue = async () => {
    if (read) {
      const value = await bleQueue.add(() => characteristic.readValue());
      setValue(value);
      return value;
    }
    return new Error(`"read" for ${name} not available`);
  };

  const startNotifications = async () =>
    notify
      ? await bleQueue.add(async () => {
          characteristic.addEventListener(
            'characteristicvaluechanged',
            listener,
          );
          return await characteristic.startNotifications();
        })
      : new Error('"notify" not available');

  const stopNotifications = async () =>
    notify
      ? await bleQueue.add(async () => {
          characteristic.removeEventListener(
            'characteristicvaluechanged',
            listener,
          );
          return await characteristic.stopNotifications();
        })
      : new Error('"notify" not available');

  useEffect(() => {
    if (!characteristic) {
      return;
    }

    readValue();
    startNotifications();

    return () => stopNotifications();
  }, []);

  return {
    [name]: value,
    [`write${pascalCase(name)}`]: writeValue,
    [`read${pascalCase(name)}`]: readValue,
    [`start${pascalCase(name)}Notifications`]: startNotifications,
    [`stop${pascalCase(name)}Notifications`]: stopNotifications,
  };
};

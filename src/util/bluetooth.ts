export const ONEWHEEL_SERVICE_UUID = 'e659f300-ea98-11e3-ac10-0800200c9a66';

export const CHARACTERISTICS = {
  aggressiveness: 'e659f31d-ea98-11e3-ac10-0800200c9a66',
  batteryCells: 'e659f31b-ea98-11e3-ac10-0800200c9a66',
  batteryCritical: 'e659f304-ea98-11e3-ac10-0800200c9a66',
  batteryLow: 'e659f305-ea98-11e3-ac10-0800200c9a66',
  batteryPercent: 'e659f303-ea98-11e3-ac10-0800200c9a66',
  batterySerialNumber: 'e659f306-ea98-11e3-ac10-0800200c9a66',
  batteryTemperature: 'e659f315-ea98-11e3-ac10-0800200c9a66',
  batteryVoltage: 'e659f316-ea98-11e3-ac10-0800200c9a66',
  currentAmps: 'e659f312-ea98-11e3-ac10-0800200c9a66',
  firmwareRevision: 'e659f311-ea98-11e3-ac10-0800200c9a66',
  hardwareRevision: 'e659f318-ea98-11e3-ac10-0800200c9a66',
  lifetimeAmpHours: 'e659f31a-ea98-11e3-ac10-0800200c9a66',
  lifetimeOdometer: 'e659f319-ea98-11e3-ac10-0800200c9a66',
  lights: 'e659f30c-ea98-11e3-ac10-0800200c9a66',
  lightsBack: 'e659f30e-ea98-11e3-ac10-0800200c9a66',
  lightsFront: 'e659f30d-ea98-11e3-ac10-0800200c9a66',
  pitch: 'e659f307-ea98-11e3-ac10-0800200c9a66',
  rideMode: 'e659f302-ea98-11e3-ac10-0800200c9a66',
  rideTrait: 'e659f31e-ea98-11e3-ac10-0800200c9a66',
  roll: 'e659f308-ea98-11e3-ac10-0800200c9a66',
  rpm: 'e659f30b-ea98-11e3-ac10-0800200c9a66',
  safetyHeadroom: 'e659f317-ea98-11e3-ac10-0800200c9a66',
  statusError: 'e659f30f-ea98-11e3-ac10-0800200c9a66',
  systemStatus: 'e659f31c-ea98-11e3-ac10-0800200c9a66',
  temperature: 'e659f310-ea98-11e3-ac10-0800200c9a66',
  tripAmpHours: 'e659f313-ea98-11e3-ac10-0800200c9a66',
  tripOdometer: 'e659f30a-ea98-11e3-ac10-0800200c9a66',
  tripRegenAmpHours: 'e659f314-ea98-11e3-ac10-0800200c9a66',
  yaw: 'e659f309-ea98-11e3-ac10-0800200c9a66',
  serialNumber: 'e659f301-ea98-11e3-ac10-0800200c9a66',
};

export const characteristics = [
  {
    characteristic: 'serialNumber',
    uuid: 'e659f301-ea98-11e3-ac10-0800200c9a66',
  },
  {characteristic: 'rideMode', uuid: 'e659f302-ea98-11e3-ac10-0800200c9a66'},
  {
    characteristic: 'batteryPercent',
    uuid: 'e659f303-ea98-11e3-ac10-0800200c9a66',
  },
  {
    characteristic: 'batteryCritical',
    uuid: 'e659f304-ea98-11e3-ac10-0800200c9a66',
  },
  {characteristic: 'batteryLow', uuid: 'e659f305-ea98-11e3-ac10-0800200c9a66'},
  {
    characteristic: 'batterySerialNumber',
    uuid: 'e659f306-ea98-11e3-ac10-0800200c9a66',
  },
  {characteristic: 'pitch', uuid: 'e659f307-ea98-11e3-ac10-0800200c9a66'},
  {characteristic: 'roll', uuid: 'e659f308-ea98-11e3-ac10-0800200c9a66'},
  {characteristic: 'yaw', uuid: 'e659f309-ea98-11e3-ac10-0800200c9a66'},
  {
    characteristic: 'tripOdometer',
    uuid: 'e659f30a-ea98-11e3-ac10-0800200c9a66',
  },
  {characteristic: 'rpm', uuid: 'e659f30b-ea98-11e3-ac10-0800200c9a66'},
  {characteristic: 'lights', uuid: 'e659f30c-ea98-11e3-ac10-0800200c9a66'},
  {characteristic: 'lightsFront', uuid: 'e659f30d-ea98-11e3-ac10-0800200c9a66'},
  {characteristic: 'lightsBack', uuid: 'e659f30e-ea98-11e3-ac10-0800200c9a66'},
  {characteristic: 'statusError', uuid: 'e659f30f-ea98-11e3-ac10-0800200c9a66'},
  {characteristic: 'temperature', uuid: 'e659f310-ea98-11e3-ac10-0800200c9a66'},
  {
    characteristic: 'firmwareRevision',
    uuid: 'e659f311-ea98-11e3-ac10-0800200c9a66',
  },
  {characteristic: 'currentAmps', uuid: 'e659f312-ea98-11e3-ac10-0800200c9a66'},
  {
    characteristic: 'tripAmpHours',
    uuid: 'e659f313-ea98-11e3-ac10-0800200c9a66',
  },
  {
    characteristic: 'tripRegenAmpHours',
    uuid: 'e659f314-ea98-11e3-ac10-0800200c9a66',
  },
  {
    characteristic: 'batteryTemperature',
    uuid: 'e659f315-ea98-11e3-ac10-0800200c9a66',
  },
  {
    characteristic: 'batteryVoltage',
    uuid: 'e659f316-ea98-11e3-ac10-0800200c9a66',
  },
  {
    characteristic: 'safetyHeadroom',
    uuid: 'e659f317-ea98-11e3-ac10-0800200c9a66',
  },
  {
    characteristic: 'hardwareRevision',
    uuid: 'e659f318-ea98-11e3-ac10-0800200c9a66',
  },
  {
    characteristic: 'lifetimeOdometer',
    uuid: 'e659f319-ea98-11e3-ac10-0800200c9a66',
  },
  {
    characteristic: 'lifetimeAmpHours',
    uuid: 'e659f31a-ea98-11e3-ac10-0800200c9a66',
  },
  {
    characteristic: 'batteryCells',
    uuid: 'e659f31b-ea98-11e3-ac10-0800200c9a66',
  },
  {
    characteristic: 'systemStatus',
    uuid: 'e659f31c-ea98-11e3-ac10-0800200c9a66',
  },
  {
    characteristic: 'aggressiveness',
    uuid: 'e659f31d-ea98-11e3-ac10-0800200c9a66',
  },
  {characteristic: 'rideTrait', uuid: 'e659f31e-ea98-11e3-ac10-0800200c9a66'},
  {characteristic: 'unknown_1', uuid: 'e659f31f-ea98-11e3-ac10-0800200c9a66'},
  {characteristic: 'unknown_2', uuid: 'e659f320-ea98-11e3-ac10-0800200c9a66'},
  {characteristic: 'serialRead', uuid: 'e659f3fe-ea98-11e3-ac10-0800200c9a66'},
  {characteristic: 'serialWrite', uuid: 'e659f3ff-ea98-11e3-ac10-0800200c9a66'},
];

export const RIDE_TRAIT_VALUES = {
  angleOffset: 0, // tilt
  turnCompensation: 1, // flow
  aggressiveness: 2, // fire
  simpleStop: 3,
};

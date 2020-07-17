export type Dayone = {
  weather?: {
    sunsetDate: string; // Date string
    weatherServiceName: string;
    temperatureCelsius: number;
    windBearing: number;
    sunriseDate: string; // Date string
    conditionsDescription: string;
    pressureMB: number;
    visibilityKM: number;
    relativeHumidity: number;
    windSpeedKPH: number;
    weatherCode: string;
    windChillCelsius: number;
  };
  photos?: {
    identifier: string;
    type: 'png' | 'jpeg';
    md: string;
  };
  location?: {
    region: {
      center: {
        longitude: number;
        latitude: number;
      };
      identifier: string;
      radius: number;
    };
    localityName: string;
    country: string;
    timeZoneName: string;
    administrativeArea: string;
    longitude: number;
    latitude: number;
    placeName: string;
  };
  timeZone?: string;
  text: string;
  richText: string;
  creationDate: string; // Date string
  modifiedDate: string; // Date string
};

export type Journey = {
  date_modified: number;
  date_journal: number;
  timezone: string;
  text: string;
  preview_text: string;
  lat?: number;
  lon?: number;
  photos?: string[];
  weather?: {
    id: number;
    degree_c: number;
    description: string;
    icon: string;
    place: string;
  };
};

export type CouchJournal = {
  markdown: string;
  date: number; // +Date
  location?: {
    // https://www.google.com/maps/@{latitude},{longitude},{zoom=16}z
    longitude: number;
    latitude: number;
  };
  weather?:
    | {
        // ???
        sunsetDate: number; // +Date
        weatherServiceName: string;
        temperatureCelsius: number;
        windBearing: number;
        sunriseDate: number; // +Date
        conditionsDescription: string;
        pressureMB: number;
        visibilityKM: number;
        relativeHumidity: number;
        windSpeedKPH: number;
        weatherCode: string;
        windChillCelsius: number;
      }
    | {
        // https://openweathermap.org/weather-conditions
        id: number;
        degree_c: number;
        description: string;
        icon: string;
        place: string;
      };
};

export type LineSetup = {
  id: string;
  floatSize?: number | '';
  mainLine?: number | '';
  lengthMeters?: number | '';
  hook?: string;
  rigNotes?: string;
  remarks?: string;
};

export type ContestEntry = {
  id?: string;
  date: string;
  location: string;
  totalWeight: number;
  ranking: string;
  waterCharacteristic: string;
  temperature?: number | null;
  weatherConditions: string[];
  lines: LineSetup[];
  groundbaitRecipe: string;
  feedingStrategy: string;
  hookBaits: string[];
  catches: string[];
};

export type WeatherSnapshot = {
  temperature: number;
  condition: string;
  icon: string;
};

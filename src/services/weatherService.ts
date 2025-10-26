import type { WeatherSnapshot } from '../types';

const SAMPLE_DATA: Record<string, { condition: string; icon: string; baseTemp: number }> = {
  default: { condition: 'Couvert', icon: '☁️', baseTemp: 15 },
  pluie: { condition: 'Pluie', icon: '🌧️', baseTemp: 12 },
  soleil: { condition: 'Soleil', icon: '☀️', baseTemp: 22 },
  vent: { condition: 'Vent', icon: '🌬️', baseTemp: 14 },
  neige: { condition: 'Neige', icon: '❄️', baseTemp: 0 },
};

const KEYWORDS: Record<string, keyof typeof SAMPLE_DATA> = {
  pluie: 'pluie',
  pluieux: 'pluie',
  orage: 'pluie',
  soleil: 'soleil',
  ensoleill: 'soleil',
  vent: 'vent',
  rafale: 'vent',
  neige: 'neige',
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function fetchHistoricalWeather(
  location: string,
  date: string
): Promise<WeatherSnapshot> {
  const normalized = location.toLowerCase();
  let key: keyof typeof SAMPLE_DATA = 'default';
  for (const keyword of Object.keys(KEYWORDS)) {
    if (normalized.includes(keyword)) {
      key = KEYWORDS[keyword];
      break;
    }
  }

  const base = SAMPLE_DATA[key];
  const jitter = (hashString(`${location}-${date}`) % 6) - 3;
  const temperature = Math.max(-5, base.baseTemp + jitter);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        temperature,
        condition: base.condition,
        icon: base.icon,
      });
    }, 350);
  });
}

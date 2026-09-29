import { CropDataSample, CropName } from '../types/crop';

interface CropDistribution {
  crop: CropName;
  n: [number, number]; // [mean, std]
  p: [number, number];
  k: [number, number];
  temp: [number, number];
  humidity: [number, number];
  ph: [number, number];
  rainfall: [number, number];
}

const DISTRIBUTIONS: CropDistribution[] = [
  {
    crop: 'Rice',
    n: [80, 8.5],
    p: [48, 7.0],
    k: [40, 3.5],
    temp: [24.0, 2.0],
    humidity: [82.5, 2.8],
    ph: [6.4, 0.35],
    rainfall: [235.0, 28.0],
  },
  {
    crop: 'Maize',
    n: [78, 9.0],
    p: [48, 6.5],
    k: [20, 2.8],
    temp: [22.5, 2.5],
    humidity: [65.0, 5.0],
    ph: [6.2, 0.35],
    rainfall: [85.0, 12.0],
  },
  {
    crop: 'Cotton',
    n: [118, 9.5],
    p: [46, 6.8],
    k: [20, 2.5],
    temp: [24.0, 1.4],
    humidity: [80.0, 3.5],
    ph: [6.8, 0.35],
    rainfall: [80.0, 9.5],
  },
  {
    crop: 'Banana',
    n: [100, 8.0],
    p: [82, 5.5],
    k: [50, 2.5],
    temp: [27.0, 1.8],
    humidity: [80.5, 2.5],
    ph: [6.0, 0.28],
    rainfall: [105.0, 10.0],
  },
  {
    crop: 'Coconut',
    n: [22, 4.5],
    p: [17, 3.8],
    k: [30, 2.5],
    temp: [27.2, 1.3],
    humidity: [95.0, 2.4],
    ph: [6.0, 0.28],
    rainfall: [175.0, 20.0],
  },
  {
    crop: 'Coffee',
    n: [101, 8.5],
    p: [28, 4.5],
    k: [30, 2.8],
    temp: [25.5, 1.8],
    humidity: [58.0, 5.0],
    ph: [6.8, 0.35],
    rainfall: [158.0, 22.0],
  },
  {
    crop: 'Mango',
    n: [20, 4.5],
    p: [27, 4.5],
    k: [30, 2.8],
    temp: [31.2, 2.2],
    humidity: [53.5, 4.5],
    ph: [5.8, 0.45],
    rainfall: [95.0, 6.5],
  },
  {
    crop: 'Papaya',
    n: [50, 6.0],
    p: [59, 5.5],
    k: [50, 2.5],
    temp: [34.0, 3.0],
    humidity: [92.5, 2.5],
    ph: [6.7, 0.28],
    rainfall: [142.0, 24.0],
  },
  {
    crop: 'Pigeonpeas',
    n: [20, 5.0],
    p: [67, 6.5],
    k: [20, 2.5],
    temp: [28.0, 3.0],
    humidity: [48.0, 6.5],
    ph: [5.8, 0.65],
    rainfall: [150.0, 25.0],
  },
  {
    crop: 'Watermelon',
    n: [99, 8.5],
    p: [17, 3.5],
    k: [50, 2.5],
    temp: [25.5, 1.4],
    humidity: [85.0, 2.6],
    ph: [6.5, 0.28],
    rainfall: [51.0, 5.5],
  },
];

// Linear congruential generator for reproducible deterministic sampling
function createRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Box-Muller transform for gaussian random variable
function boxMuller(rand: () => number, mean: number, std: number): number {
  let u1 = rand();
  let u2 = rand();
  while (u1 <= 1e-15) u1 = rand();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * std;
}

export function generateBenchmarkDataset(samplesPerCrop: number = 100): CropDataSample[] {
  const rng = createRng(42);
  const dataset: CropDataSample[] = [];

  for (const dist of DISTRIBUTIONS) {
    for (let i = 0; i < samplesPerCrop; i++) {
      const N = Math.max(0, Math.round(boxMuller(rng, dist.n[0], dist.n[1])));
      const P = Math.max(5, Math.round(boxMuller(rng, dist.p[0], dist.p[1])));
      const K = Math.max(5, Math.round(boxMuller(rng, dist.k[0], dist.k[1])));
      const temperature = parseFloat(Math.max(10, boxMuller(rng, dist.temp[0], dist.temp[1])).toFixed(2));
      const humidity = parseFloat(Math.min(100, Math.max(15, boxMuller(rng, dist.humidity[0], dist.humidity[1]))).toFixed(2));
      const ph = parseFloat(Math.min(9.5, Math.max(3.5, boxMuller(rng, dist.ph[0], dist.ph[1]))).toFixed(2));
      const rainfall = parseFloat(Math.max(20, boxMuller(rng, dist.rainfall[0], dist.rainfall[1])).toFixed(2));

      dataset.push({
        N,
        P,
        K,
        temperature,
        humidity,
        ph,
        rainfall,
        label: dist.crop,
      });
    }
  }

  // Shuffle reproducibly using Fisher-Yates
  const shuffleRng = createRng(1337);
  for (let i = dataset.length - 1; i > 0; i--) {
    const j = Math.floor(shuffleRng() * (i + 1));
    [dataset[i], dataset[j]] = [dataset[j], dataset[i]];
  }

  return dataset;
}

export const DEFAULT_CROP_DATASET: CropDataSample[] = generateBenchmarkDataset(100);

export function exportDatasetToCSV(data: CropDataSample[]): string {
  const headers = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label'];
  const rows = data.map((row) =>
    [
      row.N,
      row.P,
      row.K,
      row.temperature,
      row.humidity,
      row.ph,
      row.rainfall,
      row.label,
    ].join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

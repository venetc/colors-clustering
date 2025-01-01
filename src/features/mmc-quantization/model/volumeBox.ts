import { calcColorIndex, RIGHT_SHIFT, SIGNIFICANT_BIT, useProxyCache } from './common';

export type VolumeBoxData = {
  r1: number;
  r2: number;
  g1: number;
  g2: number;
  b1: number;
  b2: number;

  histogram: number[];

  volume: number;
  count: number;
  average: [number, number, number];
};

export type VolumeBox = ReturnType<typeof createVolumeBox>;

function createVolumeBoxRaw(
  r1: number,
  r2: number,
  g1: number,
  g2: number,
  b1: number,
  b2: number,
  histogram: number[],
) {
  const data: VolumeBoxData = {
    r1,
    r2,
    g1,
    g2,
    b1,
    b2,
    histogram,
    volume: 0,
    count: 0,
    average: [0, 0, 0],
  };

  const updateVolume = () => {
    data.volume = ((data.r2 - data.r1 + 1) * (data.g2 - data.g1 + 1) * (data.b2 - data.b1 + 1));
  }
  const updateCount = () => {
    let amount = 0;

    for (let i = data.r1; i <= data.r2; i++) {
      for (let j = data.g1; j <= data.g2; j++) {
        for (let k = data.b1; k <= data.b2; k++) {
          const index = calcColorIndex(i, j, k);

          amount += data.histogram[index] ?? 0;
        }
      }
    }

    data.count = amount;
  }
  const updateAverage = () => {
    if (data.r1 === data.r2 && data.g1 === data.g2 && data.b1 === data.b2) {
      data.average = [data.r1 << RIGHT_SHIFT, data.g1 << RIGHT_SHIFT, data.b1 << RIGHT_SHIFT];

      return data.average;
    }

    const multiplier = 1 << (8 - SIGNIFICANT_BIT);
    let total = 0;
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;

    for (let i = data.r1; i <= data.r2; i++) {
      for (let j = data.g1; j <= data.g2; j++) {
        for (let k = data.b1; k <= data.b2; k++) {
          const index = calcColorIndex(i, j, k);
          const histogramValue = data.histogram[index] ?? 0;

          total += histogramValue;

          rSum += (histogramValue * (i + 0.5) * multiplier);
          gSum += (histogramValue * (j + 0.5) * multiplier);
          bSum += (histogramValue * (k + 0.5) * multiplier);
        }
      }
    }

    if (total) {
      data.average = [
        ~~(rSum / total),
        ~~(gSum / total),
        ~~(bSum / total),
      ]

      return data.average
    }

    data.average = [
      ~~(multiplier * (data.r1 + data.r2 + 1) / 2),
      ~~(multiplier * (data.g1 + data.g2 + 1) / 2),
      ~~(multiplier * (data.b1 + data.b2 + 1) / 2),
    ];

    return data.average
  }

  const copy = () => createVolumeBoxRaw(data.r1, data.r2, data.g1, data.g2, data.b1, data.b2, [...data.histogram]);

  const contains = (color: [number, number, number]) => {
    const [r, g, b] = color.map(v => v >> RIGHT_SHIFT);

    return (r >= data.r1 && r <= data.r2) && (g >= data.g1 && g <= data.g2) && (b >= data.b1 && b <= data.b2);
  }

  const dataProxyHandlers: ProxyHandler<VolumeBoxData> = {
    get: (target, key: keyof VolumeBoxData) => {
      const getCached = useProxyCache(target);

      if (key === 'volume') return getCached('volume', updateVolume);
      if (key === 'count') return getCached('count', updateCount);
      if (key === 'average') return getCached('average', updateAverage);

      return Reflect.get(target, key);
    },
  };

  return {
    data: new Proxy<VolumeBoxData>(data, dataProxyHandlers),
    copy,
    contains,
  }
}

export function createVolumeBox(pixels: [number, number, number][], histogram: number[]) {
  const accumulator = { rMin: 1000000, rMax: 0, gMin: 1000000, gMax: 0, bMin: 1000000, bMax: 0 }
  const { rMin, rMax, gMin, gMax, bMin, bMax } = pixels.reduce(minMaxReducer, accumulator);
  return createVolumeBoxRaw(rMin, rMax, gMin, gMax, bMin, bMax, histogram);
}

type MinMaxAccumulator = { rMin: number; rMax: number; gMin: number; gMax: number; bMin: number; bMax: number }

function minMaxReducer(accumulator: MinMaxAccumulator, pixel: [number, number, number]) {
  const { rMin, rMax, gMin, gMax, bMin, bMax } = accumulator
  const { min, max } = Math

  let [r, g, b] = pixel

  r = r >> RIGHT_SHIFT;
  g = g >> RIGHT_SHIFT;
  b = b >> RIGHT_SHIFT;

  return {
    rMin: min(rMin, r),
    rMax: max(rMax, r),
    gMin: min(gMin, g),
    gMax: max(gMax, g),
    bMin: min(bMin, b),
    bMax: max(bMax, b),
  };
}

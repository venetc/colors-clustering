import type { VolumeBox } from './volumeBox';
import { calcColorIndex } from './common';

export function applyMedianCut(histogram: number[], box: VolumeBox) {
  const rangeR = box.data.r2 - box.data.r1 + 1;
  const rangeG = box.data.g2 - box.data.g1 + 1;
  const rangeB = box.data.b2 - box.data.b1 + 1;
  const maxRange = Math.max(rangeR, rangeG, rangeB);

  if (box.data.count === 1) return [box.copy(), box.copy()];

  let cumulativeSum = 0;
  const partialSums: number[] = [];
  const lookaheadSums: number[] = [];

  const calculatePartialSum = (axis: 'r' | 'g' | 'b') => {
    const startCoord = `${axis}1` as const;
    const endCoord = `${axis}2` as const;

    for (let i = box.data[startCoord]; i <= box.data[endCoord]; i++) {
      let currentSum = 0;

      switch (axis) {
        case 'r':
          for (let j = box.data.g1; j <= box.data.g2; j++) {
            for (let k = box.data.b1; k <= box.data.b2; k++) {
              const index = calcColorIndex(i, j, k);
              currentSum += histogram[index] ?? 0;
            }
          }
          break;
        case 'g':
          for (let j = box.data.r1; j <= box.data.r2; j++) {
            for (let k = box.data.b1; k <= box.data.b2; k++) {
              const index = calcColorIndex(j, i, k);
              currentSum += histogram[index] ?? 0;
            }
          }
          break;
        case 'b':
          for (let j = box.data.r1; j <= box.data.r2; j++) {
            for (let k = box.data.g1; k <= box.data.g2; k++) {
              const index = calcColorIndex(j, k, i);
              currentSum += histogram[index] ?? 0;
            }
          }
          break;
      }

      cumulativeSum += currentSum;
      partialSums[i] = cumulativeSum;
    }
  };

  switch (maxRange) {
    case rangeR:
      calculatePartialSum('r');
      break;
    case rangeG:
      calculatePartialSum('g');
      break;
    case rangeB:
      calculatePartialSum('b');
      break;
  }

  for (let i = 0; i < partialSums.length; i++) {
    lookaheadSums[i] = cumulativeSum - partialSums[i];
  }

  const splitBoxByAxis = (axis: 'r' | 'g' | 'b'): [VolumeBox, VolumeBox] => {
    const startCoord = `${axis}1` as const;
    const endCoord = `${axis}2` as const;

    for (let index = box.data[startCoord]; index <= box.data[endCoord]; index++) {
      if (partialSums[index] > cumulativeSum / 2) {
        const leftBox = box.copy();
        const rightBox = box.copy();

        const leftRange = index - box.data[startCoord];
        const rightRange = box.data[endCoord] - index;

        let splitIndex = leftRange <= rightRange
          ? Math.min(box.data[endCoord] - 1, Math.floor(index + rightRange / 2))
          : Math.max(box.data[startCoord], Math.floor(index - 1 - leftRange / 2));

        while (!partialSums[splitIndex]) splitIndex++;

        let remaining = lookaheadSums[splitIndex];

        while (!remaining && partialSums[splitIndex - 1]) {
          remaining = lookaheadSums[--splitIndex];
        }

        leftBox.data[endCoord] = splitIndex;
        rightBox.data[startCoord] = leftBox.data[endCoord] + 1;

        return [leftBox, rightBox];
      }
    }

    return [box.copy(), box.copy()];
  };

  switch (maxRange) {
    case rangeR: return splitBoxByAxis('r');
    case rangeG: return splitBoxByAxis('g');
    case rangeB: return splitBoxByAxis('b');
    default: return [box.copy(), box.copy()];
  }
}

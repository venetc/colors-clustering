import { createColorMap } from './colorMap';
import { basicPriorityQueue, type BasicPriorityQueue, compareFn, createHistogram, FRACTION, MAX_ITERATIONS } from './common';
import { applyMedianCut } from './medianCut';
import { createVolumeBox, type VolumeBox } from './volumeBox';

export function applyQuantization(pixels: [number, number, number][], maxColors: number) {
  const histogram = createHistogram(pixels);
  const volumeBox = createVolumeBox(pixels, histogram);
  const priorityQueue = basicPriorityQueue<VolumeBox>((a, b) => compareFn(a.data.count, b.data.count));

  priorityQueue.enqueue(volumeBox);

  function processQueue(queue: BasicPriorityQueue<VolumeBox>, targetColors: number) {
    let colorCount = queue.size;
    let iterations = 0;

    while (iterations < MAX_ITERATIONS && colorCount < targetColors) {
      const currentBox = queue.dequeue();
      if (!currentBox || !currentBox.data.count) continue;

      const [leftBox, rightBox] = applyMedianCut(histogram, currentBox);
      if (!leftBox) continue;

      queue.enqueue(leftBox);
      if (rightBox) {
        queue.enqueue(rightBox);
        colorCount++;
      }
      iterations++;
    }
  }

  processQueue(priorityQueue, FRACTION * maxColors);

  const refinedQueue = basicPriorityQueue<VolumeBox>((a, b) => compareFn(a.data.count * a.data.volume, b.data.count * b.data.volume));

  while (priorityQueue.size) {
    const box = priorityQueue.dequeue();
    if (box) refinedQueue.enqueue(box);
  }

  processQueue(refinedQueue, maxColors);

  const colorMap = createColorMap();

  while (refinedQueue.size) {
    const box = refinedQueue.dequeue();
    if (box) colorMap.push(box);
  }

  return colorMap;
}

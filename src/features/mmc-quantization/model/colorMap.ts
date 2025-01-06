import type { VolumeBox } from './volumeBox';
import { basicPriorityQueue, compareFn } from './common';

export type Container = {
  box: VolumeBox;
  color: [number, number, number];
}

export function createColorMap() {
  const comparator = (a: Container, b: Container) => compareFn(
    a.box.data.count * a.box.data.volume,
    b.box.data.count * b.box.data.volume,
  );
  const boxesPQueue = basicPriorityQueue<Container>(comparator);

  return {
    push: (box: VolumeBox) => boxesPQueue.enqueue({ box, color: box.data.average }),
    get palette() { return boxesPQueue.map(({ color }) => color) },
    get boxes() { return boxesPQueue.map(({ box }) => box) },
  }
}

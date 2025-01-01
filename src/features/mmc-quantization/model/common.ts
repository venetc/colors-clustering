export const SIGNIFICANT_BIT = 5 as const;
export const RIGHT_SHIFT = 8 - SIGNIFICANT_BIT;
export const MAX_ITERATIONS = 1000;
export const FRACTION = 0.75;

export function useProxyCache<T extends Record<string, unknown>>(target: T) {
  return (key: keyof T, updateFn: () => void) => {
    const value = Reflect.get(target, key);

    const isNumber = !Number.isNaN(value);
    const isArray = Array.isArray(value);

    const isInvalidNumber = isNumber && value === 0;
    const isInvalidArray = (isArray && value.length === 0) || (isArray && value.every(item => !item));

    if (isInvalidNumber || isInvalidArray) updateFn();

    return Reflect.get(target, key);
  }
}

export function calcColorIndex(r: number, g: number, b: number) {
  return (r << (2 * SIGNIFICANT_BIT)) + (g << SIGNIFICANT_BIT) + b;
}

export function createHistogram(pixels: number[][]) {
  const length = 1 << (3 * SIGNIFICANT_BIT);
  const histo = Array.from<number>({ length });

  let index: number;
  let rval: number;
  let gval: number;
  let bval: number;

  pixels.forEach((pixel) => {
    rval = pixel[0] >> RIGHT_SHIFT;
    gval = pixel[1] >> RIGHT_SHIFT;
    bval = pixel[2] >> RIGHT_SHIFT;
    index = calcColorIndex(rval, gval, bval);

    histo[index] = (histo[index] ?? 0) + 1;
  });

  return histo;
}

type CompareFn<T> = (a: T, b: T) => -1 | 1 | 0;

export const compareFn: CompareFn<number> = (a, b) => a < b ? -1 : a > b ? 1 : 0;

export type BasicPriorityQueue<T> = ReturnType<typeof basicPriorityQueue<T>>

export function basicPriorityQueue<T>(compareFn: CompareFn<T>) {
  const data: T[] = []
  let sorted = false;

  const sort = () => {
    data.sort(compareFn);
    sorted = true;
  }
  const enqueue = (element: T) => {
    data.push(element);
    sorted = false;
  }
  const at = (index: number) => {
    if (!sorted) sort();
    if (index === undefined) index = data.length - 1;
    return data[index];
  }
  const dequeue = () => {
    if (!sorted) sort();
    return data.pop();
  }
  const map = <U>(fn: (element: T) => U) => data.map<U>(fn);

  return {
    get size() { return data.length },
    enqueue,
    dequeue,
    at,
    map,
  }
}

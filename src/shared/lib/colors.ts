export function chunkRGBSkipAlpha(data: Uint8ClampedArray): [number, number, number][] {
  const chunkCount = ((data.length + 3) / 4) | 0;
  const result: [number, number, number][] = Array.from({ length: chunkCount });

  let writeIndex = 0;
  for (let i = 0; i < data.length - 3; i += 4) {
    result[writeIndex++] = [data[i], data[i + 1], data[i + 2]];
  }

  if (writeIndex < chunkCount) {
    const lastIndex = writeIndex * 4;
    result[writeIndex] = [data[lastIndex], data[lastIndex + 1] || 0, data[lastIndex + 2] || 0];
  }

  return result;
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

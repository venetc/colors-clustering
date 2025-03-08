import { mmcqModel } from '../../src/features/mmc-quantization'

describe('quantization', async () => {
  const { data: input } = await import('../mock-data/quantization-pixels-input.json', { with: { type: 'json' } }) as unknown as { data: [number, number, number][] }

  it('correct 10 colors', async () => {
    const { data: expected } = await import('../mock-data/quantization-pixels-output-10.json', { with: { type: 'json' } })
    const { palette: result } = mmcqModel.applyQuantization(input, 10)

    expect(result).toStrictEqual(expected)
  })

  it('correct 5 colors', async () => {
    const { data: expected } = await import('../mock-data/quantization-pixels-output-5.json', { with: { type: 'json' } })
    const { palette: result } = mmcqModel.applyQuantization(input, 5)

    expect(result).toStrictEqual(expected)
  })

  it('correct 3 colors', async () => {
    const { data: expected } = await import('../mock-data/quantization-pixels-output-3.json', { with: { type: 'json' } })
    const { palette: result } = mmcqModel.applyQuantization(input, 3)

    expect(result).toStrictEqual(expected)
  })
})

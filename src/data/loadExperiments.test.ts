import { describe, expect, it } from 'vitest'
import records from './experiments.json'
import { loadExperiments, validateExperimentRecords } from './loadExperiments'

describe('experiment data loading', () => {
  it('reports invalid IDs, statuses, dates, and field shapes', () => {
    const invalidRecord = {
      ...records[0],
      id: '8',
      status: 'runing',
      startedAt: '2026-02-30',
      tags: 'content',
    }

    expect(() => validateExperimentRecords([invalidRecord])).toThrowError(
      expect.objectContaining({
        message: expect.stringMatching(/8\.id:.*\n8\.status:.*\n8\.startedAt:.*\n8\.tags:/),
      }),
    )
  })

  it('fails explicitly when a referenced findings file is missing', () => {
    expect(() => loadExperiments([records[0]], {})).toThrow(
      'EXP-008: findings file "exp-008.md" was not found',
    )
  })

  it('loads findings using the referenced file path', () => {
    const loaded = loadExperiments([records[0]], { './findings/exp-008.md': 'Loaded finding' })

    expect(loaded[0].findings).toBe('Loaded finding')
  })
})

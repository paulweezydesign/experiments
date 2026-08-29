import { describe, expect, it } from 'vitest'
import { experiments } from './data/loadExperiments'
import { createExperimentReport } from './report'

describe('createExperimentReport', () => {
  it('exports the complete experiment record as markdown', () => {
    const report = createExperimentReport(experiments[0])

    expect(report).toContain('# Human-readable release notes')
    expect(report).toContain('Started: 2026-08-04')
    expect(report).toContain('## Success criteria')
    expect(report).toContain('27% lift in click-through')
    expect(report).toContain('## Decision record')
    expect(report).toContain('[PAU-18](https://linear.app)')
  })

  it('exports a not-started value for proposed experiments', () => {
    const proposed = experiments.find((experiment) => experiment.startedAt === null)!

    expect(createExperimentReport(proposed)).toContain('Started: Not started')
  })
})

import records from './experiments.json'
import findings002 from './findings/exp-002.md?raw'
import findings005 from './findings/exp-005.md?raw'
import findings008 from './findings/exp-008.md?raw'
import findings011 from './findings/exp-011.md?raw'
import findings014 from './findings/exp-014.md?raw'
import type { Experiment, ExperimentRecord } from '../types'

const findingsByFile: Record<string, string> = {
  'exp-002.md': findings002,
  'exp-005.md': findings005,
  'exp-008.md': findings008,
  'exp-011.md': findings011,
  'exp-014.md': findings014,
}

export const experiments: Experiment[] = (records as ExperimentRecord[]).map((record) => ({
  ...record,
  findings: findingsByFile[record.findingsFile] ?? 'No findings recorded.',
}))

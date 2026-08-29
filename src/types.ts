export const statuses = ['proposed', 'running', 'validated', 'promoted', 'archived'] as const

export type ExperimentStatus = (typeof statuses)[number]

export interface Link {
  label: string
  url: string
}

export interface Decision {
  date: string
  title: string
  rationale: string
  author: string
}

export interface Cost {
  money: number
  hours: number
  currency: string
}

export interface ExperimentRecord {
  id: string
  title: string
  owner: string
  status: ExperimentStatus
  startedAt: string | null
  updatedAt: string
  tags: string[]
  hypothesis: string
  successCriteria: string[]
  findingsFile: string
  cost: Cost
  artifacts: Link[]
  linearIssue: Link | null
  repository: Link | null
  decisions: Decision[]
}

export interface Experiment extends ExperimentRecord {
  findings: string
}

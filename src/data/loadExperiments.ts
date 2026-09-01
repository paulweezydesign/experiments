import records from './experiments.json'
import { statuses, type Experiment, type ExperimentRecord } from '../types'

const findingsByPath = import.meta.glob('./findings/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString)
const isDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

const isLink = (value: unknown) =>
  isObject(value) && isString(value.label) && isString(value.url) && URL.canParse(value.url)

function validateRecord(value: unknown, index: number): string[] {
  const reference = isObject(value) && isString(value.id) ? value.id : `record ${index + 1}`
  if (!isObject(value)) return [`${reference}: expected an object`]

  const errors: string[] = []
  const requireField = (valid: boolean, field: string, expectation: string) => {
    if (!valid) errors.push(`${reference}.${field}: ${expectation}`)
  }

  requireField(isString(value.id) && /^EXP-\d{3}$/.test(value.id), 'id', 'expected an ID like EXP-001')
  requireField(isString(value.title), 'title', 'expected a non-empty string')
  requireField(isString(value.owner), 'owner', 'expected a non-empty string')
  requireField(typeof value.status === 'string' && statuses.includes(value.status as (typeof statuses)[number]), 'status', `expected one of ${statuses.join(', ')}`)
  requireField(value.startedAt === null || isDate(value.startedAt), 'startedAt', 'expected null or a valid YYYY-MM-DD date')
  requireField(isDate(value.updatedAt), 'updatedAt', 'expected a valid YYYY-MM-DD date')
  requireField(isStringArray(value.tags), 'tags', 'expected an array of non-empty strings')
  requireField(isString(value.hypothesis), 'hypothesis', 'expected a non-empty string')
  requireField(isStringArray(value.successCriteria), 'successCriteria', 'expected an array of non-empty strings')
  requireField(isString(value.findingsFile) && /^[^/\\]+\.md$/.test(value.findingsFile), 'findingsFile', 'expected a Markdown filename')
  requireField(isObject(value.cost) && typeof value.cost.money === 'number' && Number.isFinite(value.cost.money) && typeof value.cost.hours === 'number' && Number.isFinite(value.cost.hours) && isString(value.cost.currency), 'cost', 'expected finite money and hours values and a currency')
  requireField(Array.isArray(value.artifacts) && value.artifacts.every(isLink), 'artifacts', 'expected an array of links')
  requireField(value.linearIssue === null || isLink(value.linearIssue), 'linearIssue', 'expected null or a link')
  requireField(value.repository === null || isLink(value.repository), 'repository', 'expected null or a link')
  requireField(Array.isArray(value.decisions) && value.decisions.every((decision) => isObject(decision) && isDate(decision.date) && isString(decision.title) && isString(decision.rationale) && isString(decision.author)), 'decisions', 'expected decisions with a valid date, title, rationale, and author')

  return errors
}

export function validateExperimentRecords(value: unknown): ExperimentRecord[] {
  if (!Array.isArray(value)) throw new Error('Invalid experiment registry:\nregistry: expected an array')

  const errors = value.flatMap(validateRecord)
  const ids = value.flatMap((record) => isObject(record) && isString(record.id) ? [record.id] : [])
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)
  duplicateIds.forEach((id) => errors.push(`${id}.id: expected a unique ID`))

  if (errors.length) throw new Error(`Invalid experiment registry:\n${errors.join('\n')}`)
  return value as ExperimentRecord[]
}

export function loadExperiments(value: unknown, findings: Record<string, string>): Experiment[] {
  return validateExperimentRecords(value).map((record) => {
    const findingsPath = `./findings/${record.findingsFile}`
    const finding = findings[findingsPath]
    if (typeof finding !== 'string') {
      throw new Error(`${record.id}: findings file "${record.findingsFile}" was not found`)
    }
    return { ...record, findings: finding }
  })
}

export const experiments = loadExperiments(records, findingsByPath)

import type { Experiment } from './types'

const linkLine = (label: string, link: Experiment['linearIssue']) =>
  link ? `- ${label}: [${link.label}](${link.url})` : `- ${label}: Not linked`

export function createExperimentReport(experiment: Experiment) {
  const criteria = experiment.successCriteria.map((criterion) => `- ${criterion}`).join('\n')
  const artifacts = experiment.artifacts.length
    ? experiment.artifacts.map((artifact) => `- [${artifact.label}](${artifact.url})`).join('\n')
    : '- No artifacts attached'
  const decisions = experiment.decisions
    .map((decision) => `### ${decision.date} — ${decision.title}\n\n${decision.rationale}\n\n_Decided by ${decision.author}_`)
    .join('\n\n')

  return `# ${experiment.title}\n\n**${experiment.id} · ${experiment.status.toUpperCase()}**\n\nOwner: ${experiment.owner}  \nLast updated: ${experiment.updatedAt}  \nTags: ${experiment.tags.join(', ')}\n\n## Hypothesis\n\n${experiment.hypothesis}\n\n## Success criteria\n\n${criteria}\n\n## Findings\n\n${experiment.findings.trim()}\n\n## Cost\n\n- ${experiment.cost.hours} hours\n- ${new Intl.NumberFormat('en-US', { style: 'currency', currency: experiment.cost.currency, maximumFractionDigits: 0 }).format(experiment.cost.money)} spend\n\n## Artifacts\n\n${artifacts}\n\n## Related work\n\n${linkLine('Linear issue', experiment.linearIssue)}\n${linkLine('Repository', experiment.repository)}\n\n## Decision record\n\n${decisions}\n`
}

export function downloadExperimentReport(experiment: Experiment) {
  const blob = new Blob([createExperimentReport(experiment)], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${experiment.id.toLowerCase()}-report.md`
  anchor.click()
  URL.revokeObjectURL(url)
}

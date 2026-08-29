import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  FileText,
  FlaskConical,
  GitFork,
  LayoutGrid,
  ListFilter,
  Search,
  UserRound,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { experiments } from './data/loadExperiments'
import { downloadExperimentReport } from './report'
import { statuses, type Experiment, type ExperimentStatus } from './types'

const statusLabels: Record<ExperimentStatus, string> = {
  proposed: 'Proposed',
  running: 'Running',
  validated: 'Validated',
  promoted: 'Promoted',
  archived: 'Archived',
}

const formatDate = (date: string | null) =>
  date
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
        new Date(`${date}T12:00:00`),
      )
    : 'Not started'

const getExperimentFromLocation = () => {
  const id = new URLSearchParams(window.location.search).get('experiment')
  return experiments.find((experiment) => experiment.id === id) ?? null
}

const scrollToTop = () => {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
}

function StatusBadge({ status }: { status: ExperimentStatus }) {
  return (
    <span className={`status status--${status}`}>
      <span className="status__dot" />
      {statusLabels[status]}
    </span>
  )
}

function MetricCard({ status }: { status: ExperimentStatus }) {
  const count = experiments.filter((experiment) => experiment.status === status).length
  return (
    <div className="metric-card">
      <span>{statusLabels[status]}</span>
      <strong>{count.toString().padStart(2, '0')}</strong>
      <div className={`metric-card__line metric-card__line--${status}`} />
    </div>
  )
}

function ExperimentCard({ experiment, onOpen }: { experiment: Experiment; onOpen: () => void }) {
  return (
    <article className="experiment-card" onClick={onOpen}>
      <div className="experiment-card__topline">
        <span className="experiment-id">{experiment.id}</span>
        <StatusBadge status={experiment.status} />
      </div>
      <div>
        <h2>{experiment.title}</h2>
        <p>{experiment.hypothesis}</p>
      </div>
      <div className="tag-list">
        {experiment.tags.map((tag) => (
          <span className="tag" key={tag}>{tag}</span>
        ))}
      </div>
      <div className="experiment-card__footer">
        <span><UserRound size={14} />{experiment.owner}</span>
        <span><CalendarDays size={14} />{formatDate(experiment.updatedAt)}</span>
        <button aria-label={`Open ${experiment.title}`} onClick={(event) => { event.stopPropagation(); onOpen() }}>
          <ChevronRight size={18} />
        </button>
      </div>
    </article>
  )
}

function Dashboard({
  onOpen,
  query,
  setQuery,
  filter,
  setFilter,
}: {
  onOpen: (experiment: Experiment) => void
  query: string
  setQuery: (query: string) => void
  filter: ExperimentStatus | 'all'
  setFilter: (filter: ExperimentStatus | 'all') => void
}) {
  const filteredExperiments = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return experiments.filter((experiment) => {
      const matchesFilter = filter === 'all' || experiment.status === filter
      const matchesQuery = !normalized || [experiment.id, experiment.title, experiment.owner, ...experiment.tags]
        .some((value) => value.toLowerCase().includes(normalized))
      return matchesFilter && matchesQuery
    })
  }, [filter, query])

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">Experiment registry</span>
          <h1>What are we<br /><em>learning?</em></h1>
        </div>
        <p className="page-header__intro">A quiet place for uncertain work. Track the question, protect the learning, and carry the evidence forward.</p>
      </header>

      <section className="metrics" aria-label="Experiment status summary">
        {statuses.map((status) => <MetricCard key={status} status={status} />)}
      </section>

      <section className="registry">
        <div className="registry__heading">
          <div>
            <span className="section-index">01 / Registry</span>
            <h2>All experiments</h2>
          </div>
          <span className="result-count">{filteredExperiments.length} {filteredExperiments.length === 1 ? 'record' : 'records'}</span>
        </div>
        <div className="toolbar">
          <label className="search-field">
            <Search size={18} />
            <span className="sr-only">Search experiments</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, owner, tag…" />
            {query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}
          </label>
          <div className="filters" role="group" aria-label="Filter by status">
            <ListFilter size={16} />
            <button aria-pressed={filter === 'all'} className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
            {statuses.map((status) => (
              <button aria-pressed={filter === status} key={status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </div>
        {filteredExperiments.length ? (
          <div className="experiment-grid">
            {filteredExperiments.map((experiment) => (
              <ExperimentCard key={experiment.id} experiment={experiment} onOpen={() => onOpen(experiment)} />
            ))}
          </div>
        ) : (
          <div className="empty-state"><FlaskConical /><h2>No matching experiments</h2><p>Try another search or status.</p></div>
        )}
      </section>
    </>
  )
}

function DetailSection({ index, title, children, className = '' }: { index: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`detail-section ${className}`}>
      <div className="detail-section__label"><span>{index}</span><h2>{title}</h2></div>
      <div className="detail-section__content">{children}</div>
    </section>
  )
}

function DetailView({ experiment, onBack }: { experiment: Experiment; onBack: () => void }) {
  return (
    <>
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to registry</button>
      <header className="detail-header">
        <div className="detail-header__meta"><span>{experiment.id}</span><StatusBadge status={experiment.status} /></div>
        <h1>{experiment.title}</h1>
        <div className="detail-header__footer">
          <div className="detail-facts">
            <span><UserRound size={15} /> {experiment.owner}</span>
            <span><CalendarDays size={15} /> Started {formatDate(experiment.startedAt)}</span>
            <span><Clock3 size={15} /> Updated {formatDate(experiment.updatedAt)}</span>
          </div>
          <button className="primary-button" onClick={() => downloadExperimentReport(experiment)}>
            <Download size={17} /> Export report
          </button>
        </div>
      </header>

      <div className="detail-layout">
        <main>
          <DetailSection index="01" title="Hypothesis">
            <p className="hypothesis">“{experiment.hypothesis}”</p>
          </DetailSection>
          <DetailSection index="02" title="Success criteria">
            <ul className="criteria-list">
              {experiment.successCriteria.map((criterion) => <li key={criterion}><Check size={16} />{criterion}</li>)}
            </ul>
          </DetailSection>
          <DetailSection index="03" title="Findings">
            <div className="markdown"><ReactMarkdown>{experiment.findings}</ReactMarkdown></div>
          </DetailSection>
          <DetailSection index="04" title="Decision record">
            <div className="timeline">
              {experiment.decisions.map((decision) => (
                <article key={`${decision.date}-${decision.title}`}>
                  <span className="timeline__marker" />
                  <time>{formatDate(decision.date)}</time>
                  <h3>{decision.title}</h3>
                  <p>{decision.rationale}</p>
                  <small>— {decision.author}</small>
                </article>
              ))}
            </div>
          </DetailSection>
        </main>
        <aside className="detail-sidebar">
          <div className="sidebar-card">
            <span className="section-index">Experiment cost</span>
            <div className="cost-grid">
              <div><Clock3 /><strong>{experiment.cost.hours}h</strong><span>Time invested</span></div>
              <div><CircleDollarSign /><strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: experiment.cost.currency, maximumFractionDigits: 0 }).format(experiment.cost.money)}</strong><span>Direct spend</span></div>
            </div>
          </div>
          <div className="sidebar-card">
            <span className="section-index">Artifacts</span>
            <div className="link-list">
              {experiment.artifacts.map((artifact) => <a key={artifact.label} href={artifact.url} target="_blank" rel="noreferrer"><FileText />{artifact.label}<ArrowUpRight /></a>)}
            </div>
          </div>
          <div className="sidebar-card">
            <span className="section-index">Related work</span>
            <div className="link-list">
              {experiment.linearIssue && <a href={experiment.linearIssue.url} target="_blank" rel="noreferrer"><LayoutGrid />Linear · {experiment.linearIssue.label}<ArrowUpRight /></a>}
              {experiment.repository && <a href={experiment.repository.url} target="_blank" rel="noreferrer"><GitFork />{experiment.repository.label}<ArrowUpRight /></a>}
              {!experiment.linearIssue && !experiment.repository && <p className="muted">No related work linked.</p>}
            </div>
          </div>
          <div className="sidebar-card sidebar-card--tags">
            <span className="section-index">Tags</span>
            <div className="tag-list">{experiment.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          </div>
        </aside>
      </div>
    </>
  )
}

export default function App() {
  const [selected, setSelected] = useState<Experiment | null>(getExperimentFromLocation)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ExperimentStatus | 'all'>('all')

  useEffect(() => {
    const handlePopState = () => setSelected(getExperimentFromLocation())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const openExperiment = (experiment: Experiment) => {
    window.history.pushState({ openedFromRegistry: true }, '', `?experiment=${experiment.id}`)
    setSelected(experiment)
    scrollToTop()
  }
  const closeExperiment = () => {
    if (!selected) return

    if (window.history.state?.openedFromRegistry) {
      window.history.back()
      return
    }

    window.history.replaceState({}, '', window.location.pathname)
    setSelected(null)
    scrollToTop()
  }

  return (
    <div className="app-shell">
      <nav className="topbar">
        <button className="brand" onClick={closeExperiment} aria-label="Go to experiment registry">
          <span className="brand__mark"><FlaskConical size={19} /></span>
          <span><strong>Fieldnotes</strong><small>Experimental practice</small></span>
        </button>
        <div className="topbar__meta"><span>Local registry</span><i /><span>Updated Aug 26, 2026</span></div>
      </nav>
      <div className="page-wrap">
        {selected ? (
          <DetailView experiment={selected} onBack={closeExperiment} />
        ) : (
          <Dashboard onOpen={openExperiment} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} />
        )}
      </div>
      <footer><span>Fieldnotes / Experimental practice</span><span>Local-first · File-backed · No integrations</span></footer>
    </div>
  )
}

import React, { useState, useCallback } from 'react';
import {
  FlaskConical, Play, CheckCircle2, XCircle, ChevronDown, ChevronRight,
  AlertTriangle, Clock, Shield, RefreshCw, Terminal,
} from 'lucide-react';

// ── Types (mirror server/src/controllers/testRunnerController.ts) ─────────────

interface StepResult {
  step: string;
  method: string;
  path: string;
  expectedStatus: number;
  actualStatus: number;
  durationMs: number;
  passed: boolean;
  errorMessage?: string;
  responseSnippet?: string;
}

interface WorkflowResult {
  id: string;
  suite: string;
  name: string;
  role: string;
  userEmail: string;
  passed: boolean;
  steps: StepResult[];
  failedStep?: string;
  errorSummary?: string;
  totalDurationMs: number;
}

interface TestRunReport {
  ranAt: string;
  durationMs: number;
  totalWorkflows: number;
  passed: number;
  failed: number;
  rolesCovered: string[];
  workflows: WorkflowResult[];
  setupErrors: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const SUITE_COLORS: Record<string, string> = {
  Public:          'bg-slate-100  text-slate-700  border-slate-300',
  Neighbor:        'bg-emerald-50 text-emerald-700 border-emerald-300',
  Merchant:        'bg-purple-50  text-purple-700  border-purple-300',
  Nonprofit:       'bg-rose-50    text-rose-700    border-rose-300',
  'Platform Admin':'bg-indigo-50  text-indigo-700  border-indigo-300',
};

const suiteColor = (suite: string) =>
  SUITE_COLORS[suite] ?? 'bg-gray-50 text-gray-700 border-gray-300';

function fmtMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function groupBySuite(workflows: WorkflowResult[]) {
  const map: Record<string, WorkflowResult[]> = {};
  for (const w of workflows) {
    (map[w.suite] ??= []).push(w);
  }
  return map;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepRow({ step }: { step: StepResult }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`text-xs border rounded px-3 py-2 mb-1 ${step.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => !step.passed && setOpen(o => !o)}>
        <div className="flex items-center gap-2">
          {step.passed
            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
            : <XCircle      className="w-3.5 h-3.5 text-red-500   shrink-0" />}
          <span className="font-mono text-[11px]">{step.step}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-gray-400">{fmtMs(step.durationMs)}</span>
          {!step.passed && (
            <span className={`font-bold ${step.actualStatus >= 500 ? 'text-red-600' : 'text-orange-500'}`}>
              {step.actualStatus || 'ERR'}
            </span>
          )}
          {!step.passed && (open
            ? <ChevronDown  className="w-3 h-3 text-gray-400" />
            : <ChevronRight className="w-3 h-3 text-gray-400" />)}
        </div>
      </div>
      {!step.passed && open && (
        <div className="mt-2 space-y-1 pl-5">
          {step.errorMessage && (
            <p className="text-red-700 font-medium">{step.errorMessage}</p>
          )}
          {step.responseSnippet && (
            <pre className="text-[10px] bg-red-100 text-red-800 rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
              {step.responseSnippet}
            </pre>
          )}
          <p className="text-gray-500">
            Expected {step.expectedStatus} → got {step.actualStatus || 'no response'}
          </p>
        </div>
      )}
    </div>
  );
}

function WorkflowCard({ w }: { w: WorkflowResult }) {
  const [open, setOpen] = useState(!w.passed);
  return (
    <div className={`border rounded-lg mb-2 overflow-hidden ${w.passed ? 'border-green-200' : 'border-red-300'}`}>
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer ${w.passed ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}`}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {w.passed
            ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            : <XCircle      className="w-4 h-4 text-red-500   shrink-0" />}
          <div className="min-w-0">
            <span className="font-medium text-sm text-gray-800">{w.name}</span>
            {!w.passed && w.errorSummary && (
              <p className="text-xs text-red-600 truncate">{w.errorSummary}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <span className="text-xs text-gray-400">{fmtMs(w.totalDurationMs)}</span>
          <span className="text-xs text-gray-500 hidden sm:block">{w.userEmail}</span>
          {open
            ? <ChevronDown  className="w-4 h-4 text-gray-400" />
            : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          {w.steps.map((s, i) => <StepRow key={i} step={s} />)}
        </div>
      )}
    </div>
  );
}

function SuiteSection({ suite, workflows }: { suite: string; workflows: WorkflowResult[] }) {
  const passed = workflows.filter(w => w.passed).length;
  const failed = workflows.length - passed;
  const color = suiteColor(suite);
  return (
    <div className="mb-6">
      <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border mb-3 ${color}`}>
        <span className="font-bold text-sm">{suite}</span>
        <span className="ml-auto text-xs font-medium">
          {passed} passed · {failed} failed · {workflows.length} workflows
        </span>
      </div>
      {workflows.map(w => <WorkflowCard key={w.id} w={w} />)}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminIntegrityTest() {
  const [running, setRunning] = useState(false);
  const [report,  setReport]  = useState<TestRunReport | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const runTests = useCallback(async () => {
    setRunning(true);
    setError(null);
    setReport(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/test/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Server returned ${res.status}: ${txt.slice(0, 200)}`);
      }
      const data: TestRunReport = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setRunning(false);
    }
  }, []);

  const suites = report ? groupBySuite(report.workflows) : {};

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FlaskConical className="w-6 h-6 text-indigo-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">System Integrity Test</h2>
          <p className="text-sm text-gray-500">
            Server-side runner — uses real DB users, mints tokens directly, exercises every workflow end-to-end
          </p>
        </div>
      </div>

      {/* Run button */}
      <button
        onClick={runTests}
        disabled={running}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
      >
        {running
          ? <><RefreshCw className="w-4 h-4 animate-spin" /> Running tests…</>
          : <><Play className="w-4 h-4" /> Run System Tests</>}
      </button>

      {running && (
        <div className="text-sm text-gray-500 animate-pulse">
          Testing all workflows across all roles — this takes 20–60 seconds…
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">Test run failed to start</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Report */}
      {report && (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{report.totalWorkflows}</p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Workflows</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{report.passed}</p>
              <p className="text-xs text-green-600 mt-1 uppercase tracking-wide">Passed</p>
            </div>
            <div className={`border rounded-xl p-4 text-center ${report.failed > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-2xl font-bold ${report.failed > 0 ? 'text-red-700' : 'text-gray-400'}`}>{report.failed}</p>
              <p className={`text-xs mt-1 uppercase tracking-wide ${report.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>Failed</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-700">{fmtMs(report.durationMs)}</p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Duration</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(report.ranAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Roles covered: {report.rolesCovered.join(', ')}
            </span>
          </div>

          {/* Setup warnings */}
          {report.setupErrors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-amber-700 text-sm">
                  DB setup warnings — some roles had no users and their suites were skipped
                </span>
              </div>
              <ul className="space-y-1">
                {report.setupErrors.map((e, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                    <span className="mt-0.5">•</span>{e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Failed workflows quick list */}
          {report.failed > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-red-700 text-sm">
                  {report.failed} failing workflow{report.failed !== 1 ? 's' : ''} — expand each card below for full HTTP error details
                </span>
              </div>
              <ul className="space-y-2">
                {report.workflows.filter(w => !w.passed).map(w => (
                  <li key={w.id} className="text-xs">
                    <span className="font-medium text-red-800">[{w.suite}] {w.name}</span>
                    {w.failedStep && (
                      <span className="text-red-600"> → failed at: <code className="font-mono">{w.failedStep}</code></span>
                    )}
                    {w.errorSummary && <p className="text-red-600 mt-0.5 pl-2 italic">{w.errorSummary}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suite-by-suite results */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Full Results by Suite
            </h3>
            {Object.entries(suites).map(([suite, workflows]) => (
              <SuiteSection key={suite} suite={suite} workflows={workflows} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

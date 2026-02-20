"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Prompt, PromptVersion, Execution } from "@/types";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

/* ─── Provider/model options ─────────────────────────────────────────────── */
const PROVIDERS: Record<string, { name: string; models: { id: string; name: string }[] }> = {
  OPENAI: {
    name: "OpenAI",
    models: [
      { id: "gpt-4", name: "GPT-4" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
    ],
  },
  ANTHROPIC: {
    name: "Anthropic",
    models: [
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
      { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
      { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
    ],
  },
  MISTRAL: {
    name: "Mistral AI",
    models: [
      { id: "mistral-large-latest", name: "Mistral Large" },
      { id: "mistral-medium-latest", name: "Mistral Medium" },
      { id: "mistral-small-latest", name: "Mistral Small" },
    ],
  },
};

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface VariantConfig {
  versionId: number | null;
  provider: string;
  model: string;
}
interface VariantResult {
  execution: Execution | null;
  loading: boolean;
  error: string | null;
}

/* ─── Small helpers ──────────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}
function StyledSelect({ value, onChange, children }: { value: string | number; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
    >
      {children}
    </select>
  );
}
function Metric({ label, value, highlight }: { label: string; value: string | number | null; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 text-center ${highlight ? "border-indigo-200 bg-indigo-50" : "border-gray-200 bg-gray-50"}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-0.5 text-base font-semibold ${highlight ? "text-indigo-700" : "text-gray-900"}`}>
        {value ?? "—"}
      </div>
    </div>
  );
}

/* ─── Variant config card ────────────────────────────────────────────────── */
function VariantCard({ label, color, config, versions, onChange }: {
  label: string; color: "indigo" | "emerald"; config: VariantConfig;
  versions: PromptVersion[]; onChange: (c: Partial<VariantConfig>) => void;
}) {
  const border = color === "indigo" ? "border-indigo-400" : "border-emerald-400";
  const badge = color === "indigo" ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white";
  const models = PROVIDERS[config.provider]?.models ?? [];

  return (
    <div className={`rounded-xl border-2 ${border} bg-white p-5 shadow-sm`}>
      <div className="mb-4 flex items-center gap-2">
        <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${badge}`}>{label}</span>
      </div>
      <div className="space-y-3">
        <Field label="Version">
          <StyledSelect value={config.versionId ?? ""} onChange={(v) => onChange({ versionId: v ? Number(v) : null })}>
            <option value="">— latest —</option>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.version_number}{v.change_notes ? ` – ${v.change_notes.slice(0, 30)}` : ""}
              </option>
            ))}
          </StyledSelect>
        </Field>
        <Field label="Provider">
          <StyledSelect value={config.provider} onChange={(p) => onChange({ provider: p, model: PROVIDERS[p]?.models[0]?.id ?? "" })}>
            {Object.entries(PROVIDERS).map(([k, p]) => <option key={k} value={k}>{p.name}</option>)}
          </StyledSelect>
        </Field>
        <Field label="Model">
          <StyledSelect value={config.model} onChange={(m) => onChange({ model: m })}>
            {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </StyledSelect>
        </Field>
      </div>
    </div>
  );
}

/* ─── Result card ────────────────────────────────────────────────────────── */
function ResultCard({ label, color, result, other }: {
  label: string; color: "indigo" | "emerald"; result: VariantResult; other: VariantResult;
}) {
  const border = color === "indigo" ? "border-indigo-400" : "border-emerald-400";
  const badge = color === "indigo" ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white";
  const exec = result.execution;
  const otherExec = other.execution;

  const better = (mine: number | null, theirs: number | null) =>
    mine != null && theirs != null && mine < theirs;

  const myTokens = exec?.tokens_used ?? null;
  const myCost = exec?.cost != null ? parseFloat(exec.cost) : null;
  const myDur = exec?.duration_ms ?? null;
  const theirTokens = otherExec?.tokens_used ?? null;
  const theirCost = otherExec?.cost != null ? parseFloat(otherExec.cost) : null;
  const theirDur = otherExec?.duration_ms ?? null;

  return (
    <div className={`flex flex-col rounded-xl border-2 ${border} bg-white shadow-sm`}>
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
        <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${badge}`}>{label}</span>
        {exec && (
          <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            exec.status === "COMPLETED" ? "bg-green-100 text-green-700" :
            exec.status === "FAILED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {exec.status === "COMPLETED" ? <CheckCircleIcon className="h-3.5 w-3.5" /> :
             exec.status === "FAILED" ? <XCircleIcon className="h-3.5 w-3.5" /> :
             <ClockIcon className="h-3.5 w-3.5" />}
            {exec.status}
          </span>
        )}
      </div>
      <div className="flex-1 p-5">
        {result.loading && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Running…
          </div>
        )}
        {result.error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{result.error}</div>}
        {!result.loading && !result.error && !exec && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">Response will appear here</div>
        )}
        {exec?.status === "COMPLETED" && exec.response && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
            <MarkdownRenderer content={exec.response} />
          </div>
        )}
        {exec?.status === "FAILED" && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{exec.error_message || "Execution failed"}</div>
        )}
      </div>
      {exec?.status === "COMPLETED" && (
        <div className="grid grid-cols-3 gap-3 border-t border-gray-100 p-5">
          <Metric label="Tokens" value={myTokens} highlight={better(myTokens, theirTokens)} />
          <Metric label="Cost ($)" value={myCost != null ? myCost.toFixed(4) : null} highlight={better(myCost, theirCost)} />
          <Metric label="Duration (ms)" value={myDur} highlight={better(myDur, theirDur)} />
        </div>
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function ABTestPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const promptId = resolvedParams.id;

  const [variantA, setVariantA] = useState<VariantConfig>({ versionId: null, provider: "OPENAI", model: "gpt-3.5-turbo" });
  const [variantB, setVariantB] = useState<VariantConfig>({ versionId: null, provider: "ANTHROPIC", model: "claude-3-haiku-20240307" });
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [resultA, setResultA] = useState<VariantResult>({ execution: null, loading: false, error: null });
  const [resultB, setResultB] = useState<VariantResult>({ execution: null, loading: false, error: null });

  const { data: prompt, isLoading } = useQuery<Prompt>({
    queryKey: ["prompt", promptId],
    queryFn: async () => (await api.get(`/prompts/templates/${promptId}/`)).data,
  });
  const { data: versions = [] } = useQuery<PromptVersion[]>({
    queryKey: ["prompt-versions", promptId],
    queryFn: async () => (await api.get(`/prompts/templates/${promptId}/versions/`)).data,
  });

  const promptBody = prompt?.current_version_data?.content ?? "";
  const extractedVars: string[] = promptBody
    ? Array.from(new Set([...promptBody.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1].trim())))
    : [];

  const pollUntilDone = async (execId: number, setter: React.Dispatch<React.SetStateAction<VariantResult>>) => {
    try {
      const r = await api.get(`/executions/${execId}/`);
      setter({ execution: r.data, loading: r.data.status === "PENDING" || r.data.status === "RUNNING", error: null });
      if (r.data.status === "PENDING" || r.data.status === "RUNNING") {
        setTimeout(() => pollUntilDone(execId, setter), 1200);
      }
    } catch {
      setter({ execution: null, loading: false, error: "Failed to fetch result" });
    }
  };

  const runVariant = async (config: VariantConfig, setter: React.Dispatch<React.SetStateAction<VariantResult>>) => {
    setter({ execution: null, loading: true, error: null });
    try {
      const payload: Record<string, unknown> = { prompt: promptId, provider: config.provider, model: config.model, input_variables: variables };
      if (config.versionId) {
        const v = versions.find((ver) => ver.id === config.versionId);
        if (v) payload.version = v.version_number;
      }
      const response = await api.post("/executions/", payload);
      setter({ execution: response.data, loading: true, error: null });
      setTimeout(() => pollUntilDone(response.data.id, setter), 1200);
    } catch (err: any) {
      setter({ execution: null, loading: false, error: err?.response?.data?.detail || err?.message || "Execution failed" });
    }
  };

  const handleRunBoth = () => {
    runVariant(variantA, setResultA);
    runVariant(variantB, setResultB);
  };

  const isRunning = resultA.loading || resultB.loading;
  const bothDone = resultA.execution?.status === "COMPLETED" && resultB.execution?.status === "COMPLETED";

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="text-gray-500">Loading…</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push(`/prompts/${promptId}`)} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <BeakerIcon className="h-7 w-7 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">A/B Test</h1>
              <p className="text-sm text-gray-500">{prompt?.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Config */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <VariantCard label="Variant A" color="indigo" config={variantA} versions={versions} onChange={(c) => setVariantA((p) => ({ ...p, ...c }))} />
          <VariantCard label="Variant B" color="emerald" config={variantB} versions={versions} onChange={(c) => setVariantB((p) => ({ ...p, ...c }))} />
        </div>

        {/* Variables */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Input Variables
            <span className="ml-2 text-xs font-normal text-gray-400">(shared by both variants)</span>
          </h2>
          {extractedVars.length === 0 ? (
            <p className="text-sm text-gray-500">This prompt has no variables — the same template body will be sent to both.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {extractedVars.map((v) => (
                <div key={v}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{`{{${v}}}`}</label>
                  <input
                    type="text"
                    value={variables[v] ?? ""}
                    onChange={(e) => setVariables((prev) => ({ ...prev, [v]: e.target.value }))}
                    placeholder={`Enter ${v}…`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Run button */}
        <div className="flex justify-center">
          <button
            onClick={handleRunBoth}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BeakerIcon className="h-5 w-5" />
            {isRunning ? "Running both variants…" : "Run Both Variants"}
          </button>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResultCard label="Variant A" color="indigo" result={resultA} other={resultB} />
          <ResultCard label="Variant B" color="emerald" result={resultB} other={resultA} />
        </div>

        {/* Summary table */}
        {bothDone && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Comparison Summary</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="pb-2 pr-6">Metric</th>
                    <th className="pb-2 pr-6 text-indigo-600">Variant A</th>
                    <th className="pb-2 pr-6 text-emerald-600">Variant B</th>
                    <th className="pb-2">Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { label: "Tokens Used", a: resultA.execution?.tokens_used ?? null, b: resultB.execution?.tokens_used ?? null, fmt: (v: number | null) => v != null ? String(v) : "—" },
                    { label: "Cost ($)", a: resultA.execution?.cost != null ? parseFloat(resultA.execution.cost) : null, b: resultB.execution?.cost != null ? parseFloat(resultB.execution.cost) : null, fmt: (v: number | null) => v != null ? v.toFixed(6) : "—" },
                    { label: "Duration (ms)", a: resultA.execution?.duration_ms ?? null, b: resultB.execution?.duration_ms ?? null, fmt: (v: number | null) => v != null ? String(v) : "—" },
                  ].map(({ label, a, b, fmt }) => {
                    let winner = "—";
                    if (a != null && b != null) winner = a === b ? "Tie" : a < b ? "Variant A" : "Variant B";
                    return (
                      <tr key={label} className="text-gray-800">
                        <td className="py-2 pr-6 font-medium">{label}</td>
                        <td className={`py-2 pr-6 ${winner === "Variant A" ? "font-bold text-indigo-700" : ""}`}>{fmt(a)}</td>
                        <td className={`py-2 pr-6 ${winner === "Variant B" ? "font-bold text-emerald-700" : ""}`}>{fmt(b)}</td>
                        <td className="py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            winner === "Variant A" ? "bg-indigo-100 text-indigo-700" :
                            winner === "Variant B" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                          }`}>{winner}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

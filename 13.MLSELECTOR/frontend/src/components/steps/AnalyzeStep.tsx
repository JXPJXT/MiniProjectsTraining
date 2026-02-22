"use client";

import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getEDA, type EDAResult, type ColumnDetail } from "@/lib/api";
import {
    Loader2, AlertCircle, ArrowRight, BarChart3, Table2, Lightbulb,
    Hash, Type, AlertTriangle, Copy, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter, Cell,
} from "recharts";

interface Props {
    slug: string;
    onContinue: () => void;
}

/* ─── Correlation Heatmap (pure CSS grid) ─────────────────────────────── */
function CorrelationHeatmap({ data }: { data: EDAResult["correlation"] }) {
    if (!data) return null;
    const { columns, values } = data;

    const getColor = (v: number | null) => {
        if (v === null) return "rgba(100,116,139,0.2)";
        const abs = Math.abs(v);
        if (v > 0) return `rgba(99,102,241,${0.15 + abs * 0.7})`;
        return `rgba(251,113,133,${0.15 + abs * 0.7})`;
    };

    return (
        <div className="overflow-x-auto">
            <div
                className="inline-grid gap-[2px] text-[10px]"
                style={{ gridTemplateColumns: `80px repeat(${columns.length}, 48px)` }}
            >
                <div />
                {columns.map((c) => (
                    <div key={c} className="text-center text-slate-500 truncate px-1 font-medium" title={c}>
                        {c.length > 6 ? c.slice(0, 6) + "…" : c}
                    </div>
                ))}
                {values.map((row, ri) => (
                    <React.Fragment key={`row-${ri}`}>
                        <div className="text-right text-slate-500 pr-2 truncate font-medium" title={columns[ri]}>
                            {columns[ri].length > 10 ? columns[ri].slice(0, 10) + "…" : columns[ri]}
                        </div>
                        {row.map((v, ci) => (
                            <div
                                key={`${ri}-${ci}`}
                                className="w-12 h-8 flex items-center justify-center rounded text-[9px] font-mono"
                                style={{ background: getColor(v) }}
                                title={`${columns[ri]} × ${columns[ci]}: ${v?.toFixed(2) ?? "N/A"}`}
                            >
                                {v !== null ? v.toFixed(1) : "–"}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

/* ─── Column Detail Card ──────────────────────────────────────────────── */
function ColumnCard({ col }: { col: ColumnDetail }) {
    const [expanded, setExpanded] = useState(false);
    const isNumeric = !!col.stats;

    const histData =
        col.histogram?.counts.map((count, i) => ({
            bin: col.histogram!.bins[i].toFixed(1),
            count,
        })) || [];

    return (
        <div className="metric-card p-5">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            isNumeric ? "bg-cyan-500/15 text-cyan-400" : "bg-amber-500/15 text-amber-400"
                        )}
                    >
                        {isNumeric ? <Hash className="w-4 h-4" /> : <Type className="w-4 h-4" />}
                    </div>
                    <div className="text-left">
                        <span className="text-sm font-semibold text-white">{col.name}</span>
                        <span className="ml-2 text-xs text-slate-500">{col.dtype}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {col.missing > 0 && (
                        <span className="badge badge-rose text-[10px]">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {col.missing_pct}% missing
                        </span>
                    )}
                    {expanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                </div>
            </button>

            {expanded && (
                <div className="mt-4 animate-fade-in-up">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <MiniStat label="Unique" value={col.unique} />
                        <MiniStat label="Missing" value={col.missing} />
                        {isNumeric && (
                            <>
                                <MiniStat label="Mean" value={col.stats?.mean?.toFixed(2) ?? "–"} />
                                <MiniStat label="Std" value={col.stats?.std?.toFixed(2) ?? "–"} />
                            </>
                        )}
                    </div>

                    {/* Histogram for numeric columns */}
                    {isNumeric && histData.length > 0 && (
                        <div className="mt-3">
                            <p className="text-xs text-slate-500 mb-2 font-medium">Distribution</p>
                            <ResponsiveContainer width="100%" height={120}>
                                <BarChart data={histData}>
                                    <XAxis dataKey="bin" tick={false} axisLine={false} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#1a1f35",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                        }}
                                    />
                                    <Bar dataKey="count" fill="rgba(99,102,241,0.6)" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Top values for categorical */}
                    {!isNumeric && col.top_values && (
                        <div className="mt-3 space-y-1">
                            <p className="text-xs text-slate-500 mb-2 font-medium">Top Values</p>
                            {Object.entries(col.top_values)
                                .slice(0, 5)
                                .map(([val, count]) => (
                                    <div key={val} className="flex items-center gap-2 text-xs">
                                        <span className="text-slate-300 font-mono truncate max-w-[140px]">{val}</span>
                                        <div className="flex-1 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500/50 rounded-full"
                                                style={{
                                                    width: `${(count / Object.values(col.top_values!)[0]) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-slate-500">{count}</span>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-white/[0.03] rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-white">{value}</p>
        </div>
    );
}

/* ─── Main component ──────────────────────────────────────────────────── */
export default function AnalyzeStep({ slug, onContinue }: Props) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["eda", slug],
        queryFn: () => getEDA(slug),
    });

    if (isLoading)
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                <p className="text-slate-400">Running exploratory analysis… this might take a moment.</p>
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center py-32 text-rose-400 gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>Analysis failed: {(error as Error).message}</span>
            </div>
        );

    if (!data) return null;

    return (
        <div className="animate-fade-in-up space-y-8">
            {/* Section title */}
            <div>
                <h2 className="text-2xl font-bold mb-1">
                    Exploratory Data Analysis —{" "}
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        {data.dataset}
                    </span>
                </h2>
                <p className="text-slate-400 text-sm">
                    Let&apos;s understand the data before we throw any models at it. Here&apos;s what we found.
                </p>
            </div>

            {/* ─── Overview Cards ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <OverviewCard icon={<Table2 className="w-5 h-5" />} label="Rows" value={data.shape.rows.toLocaleString()} color="indigo" />
                <OverviewCard icon={<BarChart3 className="w-5 h-5" />} label="Columns" value={data.shape.cols} color="violet" />
                <OverviewCard
                    icon={<AlertTriangle className="w-5 h-5" />}
                    label="Missing Cells"
                    value={data.columns.reduce((s, c) => s + c.missing, 0).toLocaleString()}
                    color="amber"
                />
                <OverviewCard icon={<Copy className="w-5 h-5" />} label="Duplicates" value={data.duplicates} color="rose" />
            </div>

            {/* ─── Insights ──────────────────────────────────────────────── */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    Auto‑Generated Insights
                </h3>
                <div className="space-y-3">
                    {data.insights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                            </div>
                            <p
                                className="text-sm text-slate-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Column Details ────────────────────────────────────────── */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Column‑by‑Column Breakdown</h3>
                <div className="space-y-3">
                    {data.columns.map((col) => (
                        <ColumnCard key={col.name} col={col} />
                    ))}
                </div>
            </div>

            {/* ─── Correlation Heatmap ───────────────────────────────────── */}
            {data.correlation && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Correlation Heatmap</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        Blue means positive correlation (both go up together). Red means negative
                        (one goes up, the other goes down). Darker = stronger relationship.
                    </p>
                    <CorrelationHeatmap data={data.correlation} />
                </div>
            )}

            {/* ─── Continue button ───────────────────────────────────────── */}
            <div className="flex justify-end">
                <button
                    onClick={onContinue}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer"
                >
                    Continue to Training
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function OverviewCard({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
}) {
    const bg: Record<string, string> = {
        indigo: "bg-indigo-500/10 text-indigo-400",
        violet: "bg-violet-500/10 text-violet-400",
        amber: "bg-amber-500/10 text-amber-400",
        rose: "bg-rose-500/10 text-rose-400",
    };

    return (
        <div className="glass-card p-5 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bg[color])}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
}

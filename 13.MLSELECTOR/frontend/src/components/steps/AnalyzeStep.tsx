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
} from "recharts";

interface Props {
    slug: string;
    onContinue: () => void;
}

/* ─── Correlation Heatmap ────────────────────────────────────────────── */
function CorrelationHeatmap({ data }: { data: EDAResult["correlation"] }) {
    if (!data) return null;
    const { columns, values } = data;

    const getColor = (v: number | null) => {
        if (v === null) return "rgba(255,255,255,0.03)";
        const abs = Math.abs(v);
        if (v > 0) return `rgba(255,255,255,${0.03 + abs * 0.2})`;
        return `rgba(239,68,68,${0.05 + abs * 0.25})`;
    };

    return (
        <div className="overflow-x-auto">
            <div
                className="inline-grid gap-[1px] text-[10px]"
                style={{ gridTemplateColumns: `80px repeat(${columns.length}, 48px)` }}
            >
                <div />
                {columns.map((c) => (
                    <div key={c} className="text-center text-white/25 truncate px-1 font-medium" title={c}>
                        {c.length > 6 ? c.slice(0, 6) + "…" : c}
                    </div>
                ))}
                {values.map((row, ri) => (
                    <React.Fragment key={`row-${ri}`}>
                        <div className="text-right text-white/25 pr-2 truncate font-medium" title={columns[ri]}>
                            {columns[ri].length > 10 ? columns[ri].slice(0, 10) + "…" : columns[ri]}
                        </div>
                        {row.map((v, ci) => (
                            <div
                                key={`${ri}-${ci}`}
                                className="w-12 h-8 flex items-center justify-center rounded text-[9px] font-mono text-white/50"
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
        <div className="metric-card p-4">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between cursor-pointer"
            >
                <div className="flex items-center gap-2.5">
                    <div
                        className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center border",
                            isNumeric
                                ? "bg-blue-500/5 text-blue-400/70 border-blue-500/10"
                                : "bg-amber-500/5 text-amber-400/70 border-amber-500/10"
                        )}
                    >
                        {isNumeric ? <Hash className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
                    </div>
                    <div className="text-left">
                        <span className="text-sm font-medium text-white/80">{col.name}</span>
                        <span className="ml-2 text-[10px] text-white/20 font-mono">{col.dtype}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {col.missing > 0 && (
                        <span className="text-[10px] text-red-400/60 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {col.missing_pct}%
                        </span>
                    )}
                    {expanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-white/20" />
                    ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-white/20" />
                    )}
                </div>
            </button>

            {expanded && (
                <div className="mt-3 pt-3 border-t border-white/[0.04] animate-fade-in-up">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        <MiniStat label="Unique" value={col.unique} />
                        <MiniStat label="Missing" value={col.missing} />
                        {isNumeric && (
                            <>
                                <MiniStat label="Mean" value={col.stats?.mean?.toFixed(2) ?? "–"} />
                                <MiniStat label="Std" value={col.stats?.std?.toFixed(2) ?? "–"} />
                            </>
                        )}
                    </div>

                    {isNumeric && histData.length > 0 && (
                        <div className="mt-2">
                            <p className="text-[10px] text-white/20 mb-1.5 uppercase tracking-wider font-medium">Distribution</p>
                            <ResponsiveContainer width="100%" height={100}>
                                <BarChart data={histData}>
                                    <XAxis dataKey="bin" tick={false} axisLine={false} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#111",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            borderRadius: "6px",
                                            fontSize: "11px",
                                            color: "#aaa",
                                        }}
                                    />
                                    <Bar dataKey="count" fill="rgba(255,255,255,0.12)" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {!isNumeric && col.top_values && (
                        <div className="mt-2 space-y-1">
                            <p className="text-[10px] text-white/20 mb-1.5 uppercase tracking-wider font-medium">Top Values</p>
                            {Object.entries(col.top_values)
                                .slice(0, 5)
                                .map(([val, count]) => (
                                    <div key={val} className="flex items-center gap-2 text-xs">
                                        <span className="text-white/40 font-mono truncate max-w-[140px]">{val}</span>
                                        <div className="flex-1 h-[3px] bg-white/[0.03] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-white/10 rounded-full"
                                                style={{
                                                    width: `${(count / Object.values(col.top_values!)[0]) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-white/20 text-[10px] font-mono">{count}</span>
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
        <div className="bg-white/[0.02] rounded-md p-2 text-center border border-white/[0.03]">
            <p className="text-[9px] text-white/20 uppercase tracking-wider">{label}</p>
            <p className="text-xs font-semibold text-white/70">{value}</p>
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
            <div className="flex flex-col items-center justify-center py-32 gap-3">
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
                <p className="text-white/30 text-sm">Running exploratory analysis…</p>
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center py-32 text-red-400/70 gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">Analysis failed: {(error as Error).message}</span>
            </div>
        );

    if (!data) return null;

    return (
        <div className="animate-fade-in-up space-y-8">
            {/* Section title */}
            <div>
                <h2 className="text-2xl font-bold mb-1 tracking-tight">
                    Exploratory Data Analysis
                </h2>
                <p className="text-white/30 text-sm">
                    Understanding <span className="text-white/60 font-medium">{data.dataset}</span> before training any models.
                </p>
            </div>

            {/* ─── Overview Cards ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <OverviewCard icon={<Table2 className="w-4 h-4" />} label="Rows" value={data.shape.rows.toLocaleString()} />
                <OverviewCard icon={<BarChart3 className="w-4 h-4" />} label="Columns" value={data.shape.cols} />
                <OverviewCard
                    icon={<AlertTriangle className="w-4 h-4" />}
                    label="Missing"
                    value={data.columns.reduce((s, c) => s + c.missing, 0).toLocaleString()}
                />
                <OverviewCard icon={<Copy className="w-4 h-4" />} label="Duplicates" value={data.duplicates} />
            </div>

            {/* ─── Insights ──────────────────────────────────────────────── */}
            <div className="glass-card p-5">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 text-white/70">
                    <Lightbulb className="w-4 h-4 text-amber-400/60" />
                    Auto‑Generated Insights
                </h3>
                <div className="space-y-2.5">
                    {data.insights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-white/[0.04] text-white/30 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                            </div>
                            <p
                                className="text-xs text-white/40 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white/70">$1</strong>') }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Column Details ────────────────────────────────────────── */}
            <div>
                <h3 className="text-sm font-semibold mb-3 text-white/60">Column Breakdown</h3>
                <div className="space-y-2">
                    {data.columns.map((col) => (
                        <ColumnCard key={col.name} col={col} />
                    ))}
                </div>
            </div>

            {/* ─── Correlation Heatmap ───────────────────────────────────── */}
            {data.correlation && (
                <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold mb-1 text-white/60">Correlation Matrix</h3>
                    <p className="text-xs text-white/20 mb-4">
                        Brighter cells = stronger relationship. Red = negative correlation.
                    </p>
                    <CorrelationHeatmap data={data.correlation} />
                </div>
            )}

            {/* ─── Continue button ───────────────────────────────────────── */}
            <div className="flex justify-end">
                <button
                    onClick={onContinue}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition cursor-pointer"
                >
                    Continue to Training
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

function OverviewCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}) {
    return (
        <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.05] flex items-center justify-center text-white/40">
                {icon}
            </div>
            <div>
                <p className="text-[10px] text-white/20 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-bold text-white/80">{value}</p>
            </div>
        </div>
    );
}

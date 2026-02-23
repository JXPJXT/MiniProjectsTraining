"use client";

import { type TrainResult, type MetricDetail } from "@/lib/api";
import { useState } from "react";
import {
    Trophy, Clock, ChevronDown, ChevronUp, RotateCcw,
    Target, Layers, Sparkles, Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, BarChart, Bar, Cell,
} from "recharts";

interface Props {
    results: TrainResult;
    onReset: () => void;
}

/* ─── Metric Card ────────────────────────────────────────────────────── */
function MetricCard({ id, metric }: { id: string; metric: MetricDetail }) {
    const [expanded, setExpanded] = useState(false);

    const getValueColor = () => {
        const v = metric.value;
        if (v === null) return "text-white/30";
        if (id.includes("r_squared") || id === "accuracy" || id === "f1_score" || id === "roc_auc" || id === "silhouette_score") {
            if (v >= 0.8) return "text-green-400";
            if (v >= 0.6) return "text-amber-400";
            return "text-red-400";
        }
        if (id === "davies_bouldin") {
            if (v <= 1.0) return "text-green-400";
            if (v <= 2.0) return "text-amber-400";
            return "text-red-400";
        }
        return "text-white/70";
    };

    return (
        <div className="metric-card p-4 group">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <p className="text-[10px] text-white/20 uppercase tracking-wider font-medium mb-0.5">
                        {metric.name}
                    </p>
                    <p className={cn("text-2xl font-bold", getValueColor())}>
                        {metric.value !== null ? metric.value.toFixed(4) : "N/A"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="badge badge-indigo text-[9px]">{metric.good_range}</span>
                    {expanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-white/20" />
                    ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-white/20" />
                    )}
                </div>
            </div>

            {expanded && (
                <div className="mt-3 pt-3 border-t border-white/[0.04] animate-fade-in-up space-y-2">
                    <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-xs text-white/40 leading-relaxed">{metric.explanation}</p>
                    </div>
                    <p className="text-[10px] text-white/20">
                        <strong className="text-white/35">Why it matters:</strong> {metric.why_care}
                    </p>
                </div>
            )}
        </div>
    );
}

/* ─── Chart tooltip ──────────────────────────────────────────────────── */
const chartTooltipStyle = {
    background: "#111",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "6px",
    fontSize: "11px",
    color: "#888",
};

/* ─── Cluster scatter ────────────────────────────────────────────────── */
const CLUSTER_COLORS = [
    "#ffffff", "#888888", "#555555", "#3b82f6", "#22c55e",
    "#f59e0b", "#ef4444", "#a855f7", "#06b6d4", "#ec4899",
];

function ClusterScatter({ data }: { data: { x: number; y: number; cluster: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={380}>
            <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="x" name="PC 1" tick={{ fill: "#444", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                <YAxis dataKey="y" name="PC 2" tick={{ fill: "#444", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
                {Array.from(new Set(data.map((d) => d.cluster)))
                    .filter((c) => c >= 0)
                    .map((cluster) => (
                        <Scatter
                            key={cluster}
                            name={`Cluster ${cluster}`}
                            data={data.filter((d) => d.cluster === cluster)}
                            fill={CLUSTER_COLORS[cluster % CLUSTER_COLORS.length]}
                            opacity={0.5}
                        />
                    ))}
            </ScatterChart>
        </ResponsiveContainer>
    );
}

/* ─── Regression scatter ─────────────────────────────────────────────── */
function RegressionScatter({ data }: { data: { actual: number; predicted: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis
                    dataKey="actual" name="Actual"
                    tick={{ fill: "#444", fontSize: 10 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    label={{ value: "Actual", fill: "#555", position: "bottom", offset: -5, fontSize: 10 }}
                />
                <YAxis
                    dataKey="predicted" name="Predicted"
                    tick={{ fill: "#444", fontSize: 10 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    label={{ value: "Predicted", fill: "#555", angle: -90, position: "insideLeft", fontSize: 10 }}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Scatter data={data} fill="rgba(255,255,255,0.35)" opacity={0.6} />
            </ScatterChart>
        </ResponsiveContainer>
    );
}

/* ─── Elbow & Silhouette ─────────────────────────────────────────────── */
function ElbowChart({ data, bestK }: { data: { k: number; inertia: number }[]; bestK: number }) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="k" tick={{ fill: "#444", fontSize: 10 }} label={{ value: "Clusters (k)", fill: "#555", position: "bottom", offset: -5, fontSize: 10 }} />
                <YAxis tick={{ fill: "#444", fontSize: 10 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="inertia" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} dot={{ fill: "#fff", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}

function SilhouetteChart({ data }: { data: { k: number; score: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="k" tick={{ fill: "#444", fontSize: 10 }} />
                <YAxis tick={{ fill: "#444", fontSize: 10 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                    {data.map((entry, i) => (
                        <Cell key={i} fill={entry.score === Math.max(...data.map((d) => d.score)) ? "#fff" : "rgba(255,255,255,0.15)"} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

/* ─── Main Results Component ─────────────────────────────────────────── */
export default function ResultsStep({ results, onReset }: Props) {
    const r = results;

    return (
        <div className="animate-fade-in-up space-y-6">
            {/* ─── Hero summary ──────────────────────────────────────── */}
            <div className="glass-card p-6 border-l-2 border-l-green-500/40">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400/80 flex items-center justify-center">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white/90">Training Complete</h2>
                            <p className="text-white/30 text-xs">
                                <span className="text-white/60">{r.model_name}</span> · <span className="capitalize">{r.task}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="text-center">
                            <p className="text-[9px] text-white/20 uppercase tracking-wider">Time</p>
                            <p className="text-sm font-bold text-white/60 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {r.training_time_seconds}s
                            </p>
                        </div>
                        {r.feature_count && (
                            <div className="text-center">
                                <p className="text-[9px] text-white/20 uppercase tracking-wider">Features</p>
                                <p className="text-sm font-bold text-white/60">{r.feature_count}</p>
                            </div>
                        )}
                        {r.train_size && (
                            <div className="text-center">
                                <p className="text-[9px] text-white/20 uppercase tracking-wider">Train / Test</p>
                                <p className="text-sm font-bold text-white/60">
                                    {r.train_size} / {r.test_size}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Preprocessing ─────────────────────────────────────── */}
            <div className="glass-card p-5">
                <h3 className="text-xs font-semibold flex items-center gap-1.5 mb-3 text-white/50 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5" />
                    Preprocessing Pipeline
                </h3>
                <div className="space-y-1.5">
                    {r.preprocessing_steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-white/[0.04] text-white/20 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                            </span>
                            <p className="text-xs text-white/30">{step}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Metrics ───────────────────────────────────────────── */}
            <div>
                <h3 className="text-xs font-semibold flex items-center gap-1.5 mb-3 text-white/50 uppercase tracking-wider">
                    <Gauge className="w-3.5 h-3.5" />
                    Metrics
                    <span className="text-white/15 font-normal normal-case ml-1">click to expand</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                    {Object.entries(r.metrics).map(([id, metric]) => (
                        <MetricCard key={id} id={id} metric={metric} />
                    ))}
                </div>
            </div>

            {/* ─── Regression: Actual vs Predicted ────────────────────── */}
            {r.task === "regression" && r.scatter && (
                <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold mb-1 text-white/60">Actual vs Predicted</h3>
                    <p className="text-xs text-white/20 mb-4">
                        Points near the diagonal = better predictions.
                    </p>
                    <RegressionScatter data={r.scatter as unknown as { actual: number; predicted: number }[]} />
                </div>
            )}

            {/* ─── Clustering visuals ─────────────────────────────────── */}
            {r.task === "clustering" && (
                <>
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-white/30" />
                            <h3 className="text-sm font-semibold text-white/60">Clustering Summary</h3>
                        </div>
                        <p className="text-xs text-white/25 leading-relaxed">
                            Auto‑detected optimal: <strong className="text-white/50">{r.auto_k} clusters</strong>.
                            Final model used: <strong className="text-white/50">{r.n_clusters} clusters</strong>.
                            {r.pca_components && (
                                <> Reduced to <strong className="text-white/50">{r.pca_components} PCA components</strong> ({r.variance_explained}% variance).</>
                            )}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {r.elbow && r.elbow.length > 0 && (
                            <div className="glass-card p-5">
                                <h4 className="text-xs font-semibold text-white/40 mb-1 uppercase tracking-wider">Elbow Method</h4>
                                <p className="text-[10px] text-white/15 mb-3">The &quot;elbow&quot; = diminishing returns on more clusters.</p>
                                <ElbowChart data={r.elbow} bestK={r.auto_k || 4} />
                            </div>
                        )}
                        {r.silhouette_curve && r.silhouette_curve.length > 0 && (
                            <div className="glass-card p-5">
                                <h4 className="text-xs font-semibold text-white/40 mb-1 uppercase tracking-wider">Silhouette Scores</h4>
                                <p className="text-[10px] text-white/15 mb-3">Taller bar = better cluster definition. White = best.</p>
                                <SilhouetteChart data={r.silhouette_curve} />
                            </div>
                        )}
                    </div>

                    {r.scatter && r.scatter.length > 0 && (
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold mb-1 text-white/60">Cluster Visualization (PCA 2D)</h3>
                            <p className="text-xs text-white/20 mb-4">Each dot is a data point. Tight, separated groups = strong clustering.</p>
                            <ClusterScatter data={r.scatter as unknown as { x: number; y: number; cluster: number }[]} />
                        </div>
                    )}

                    {r.cluster_profiles && r.cluster_profiles.length > 0 && (
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold mb-3 text-white/60">Cluster Profiles</h3>
                            <p className="text-xs text-white/20 mb-4">Average feature values per cluster.</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-white/[0.04]">
                                            <th className="text-left py-2 px-2 text-white/25 font-medium">Cluster</th>
                                            <th className="text-left py-2 px-2 text-white/25 font-medium">Size</th>
                                            {Object.keys(r.cluster_profiles[0])
                                                .filter((k) => k !== "cluster" && k !== "size")
                                                .slice(0, 6)
                                                .map((key) => (
                                                    <th key={key} className="text-left py-2 px-2 text-white/25 font-medium truncate max-w-[100px]" title={key}>
                                                        {key.length > 12 ? key.slice(0, 12) + "…" : key}
                                                    </th>
                                                ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {r.cluster_profiles.map((profile, i) => (
                                            <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                                                <td className="py-2 px-2">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full"
                                                            style={{ background: CLUSTER_COLORS[(profile.cluster as number) % CLUSTER_COLORS.length] }}
                                                        />
                                                        <span className="font-medium text-white/60">
                                                            {profile.cluster as number}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2 text-white/40">{profile.size as number}</td>
                                                {Object.entries(profile)
                                                    .filter(([k]) => k !== "cluster" && k !== "size")
                                                    .slice(0, 6)
                                                    .map(([k, v]) => (
                                                        <td key={k} className="py-2 px-2 text-white/30 font-mono text-[10px]">
                                                            {typeof v === "number" ? v.toFixed(2) : String(v)}
                                                        </td>
                                                    ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ─── Classification: classes ─────────────────────────────── */}
            {r.task === "classification" && r.classes && (
                <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3 text-white/60">
                        <Target className="w-4 h-4 text-white/30" />
                        Classes Detected
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                        {r.classes.map((cls) => (
                            <span key={cls} className="badge badge-indigo text-[10px]">
                                {cls}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Reset ──────────────────────────────────────────────── */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:bg-white/[0.08] hover:text-white/60 transition cursor-pointer text-sm font-medium"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Explore Another Dataset
                </button>
            </div>
        </div>
    );
}

"use client";

import { type TrainResult, type MetricDetail } from "@/lib/api";
import { useState } from "react";
import {
    Trophy, Clock, ChevronDown, ChevronUp, ArrowRight, RotateCcw,
    Target, BarChart3, Layers, Sparkles, CheckCircle2, Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, Legend, BarChart, Bar, Cell,
} from "recharts";

interface Props {
    results: TrainResult;
    onReset: () => void;
}

/* ─── Metric Card ─────────────────────────────────────────────────────── */

function MetricCard({ id, metric }: { id: string; metric: MetricDetail }) {
    const [expanded, setExpanded] = useState(false);

    const getValueColor = () => {
        const v = metric.value;
        if (v === null) return "text-slate-400";
        // Heuristic coloring
        if (id.includes("r_squared") || id === "accuracy" || id === "f1_score" || id === "roc_auc" || id === "silhouette_score") {
            if (v >= 0.8) return "text-emerald-400";
            if (v >= 0.6) return "text-amber-400";
            return "text-rose-400";
        }
        if (id === "davies_bouldin") {
            if (v <= 1.0) return "text-emerald-400";
            if (v <= 2.0) return "text-amber-400";
            return "text-rose-400";
        }
        return "text-cyan-400";
    };

    return (
        <div className="metric-card p-5 group">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
                        {metric.name}
                    </p>
                    <p className={cn("text-3xl font-bold", getValueColor())}>
                        {metric.value !== null ? metric.value.toFixed(4) : "N/A"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="badge badge-indigo text-[10px]">{metric.good_range}</span>
                    {expanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                </div>
            </div>

            {expanded && (
                <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in-up space-y-3">
                    <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                        <p className="text-sm text-slate-300 leading-relaxed">{metric.explanation}</p>
                    </div>
                    <p className="text-xs text-slate-500">
                        <strong className="text-slate-400">Why it matters:</strong> {metric.why_care}
                    </p>
                </div>
            )}
        </div>
    );
}

/* ─── Cluster scatter ─────────────────────────────────────────────────── */
const CLUSTER_COLORS = [
    "#818cf8", "#34d399", "#fbbf24", "#fb7185", "#22d3ee",
    "#a78bfa", "#f472b6", "#2dd4bf", "#f59e0b", "#6366f1",
];

function ClusterScatter({ data }: { data: { x: number; y: number; cluster: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="x" name="PC 1" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                <YAxis dataKey="y" name="PC 2" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                <Tooltip
                    contentStyle={{
                        background: "#1a1f35",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "12px",
                    }}
                    cursor={{ strokeDasharray: "3 3" }}
                />
                {Array.from(new Set(data.map((d) => d.cluster)))
                    .filter((c) => c >= 0)
                    .map((cluster) => (
                        <Scatter
                            key={cluster}
                            name={`Cluster ${cluster}`}
                            data={data.filter((d) => d.cluster === cluster)}
                            fill={CLUSTER_COLORS[cluster % CLUSTER_COLORS.length]}
                            opacity={0.7}
                        />
                    ))}
            </ScatterChart>
        </ResponsiveContainer>
    );
}

/* ─── Regression scatter ──────────────────────────────────────────────── */
function RegressionScatter({ data }: { data: { actual: number; predicted: number }[] }) {
    const min = Math.min(...data.map((d) => Math.min(d.actual, d.predicted)));
    const max = Math.max(...data.map((d) => Math.max(d.actual, d.predicted)));

    return (
        <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                    dataKey="actual"
                    name="Actual"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    label={{ value: "Actual", fill: "#64748b", position: "bottom", offset: -5 }}
                />
                <YAxis
                    dataKey="predicted"
                    name="Predicted"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    label={{ value: "Predicted", fill: "#64748b", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                    contentStyle={{
                        background: "#1a1f35",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "12px",
                    }}
                />
                <Scatter data={data} fill="#818cf8" opacity={0.6} />
            </ScatterChart>
        </ResponsiveContainer>
    );
}

/* ─── Elbow & Silhouette Charts ───────────────────────────────────────── */
function ElbowChart({ data, bestK }: { data: { k: number; inertia: number }[]; bestK: number }) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="k" tick={{ fill: "#64748b", fontSize: 11 }} label={{ value: "Number of Clusters (k)", fill: "#64748b", position: "bottom", offset: -5 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1a1f35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="inertia" stroke="#818cf8" strokeWidth={2} dot={{ fill: "#818cf8", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}

function SilhouetteChart({ data }: { data: { k: number; score: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="k" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1a1f35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {data.map((entry, i) => (
                        <Cell key={i} fill={entry.score === Math.max(...data.map((d) => d.score)) ? "#34d399" : "rgba(99,102,241,0.5)"} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

/* ─── Main Results Component ──────────────────────────────────────────── */
export default function ResultsStep({ results, onReset }: Props) {
    const r = results;

    return (
        <div className="animate-fade-in-up space-y-8">
            {/* ─── Hero summary ──────────────────────────────────────────── */}
            <div className="glass-card p-8 border-l-4 border-l-emerald-500">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                            <Trophy className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Training Complete!</h2>
                            <p className="text-slate-400 text-sm">
                                <span className="text-white font-medium">{r.model_name}</span> on a{" "}
                                <span className="text-emerald-400 font-medium capitalize">{r.task}</span> task
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-xs text-slate-500">Training Time</p>
                            <p className="text-lg font-bold text-cyan-400 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {r.training_time_seconds}s
                            </p>
                        </div>
                        {r.feature_count && (
                            <div className="text-center">
                                <p className="text-xs text-slate-500">Features</p>
                                <p className="text-lg font-bold text-violet-400">{r.feature_count}</p>
                            </div>
                        )}
                        {r.train_size && (
                            <div className="text-center">
                                <p className="text-xs text-slate-500">Train / Test</p>
                                <p className="text-lg font-bold text-indigo-400">
                                    {r.train_size} / {r.test_size}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Preprocessing transparency ────────────────────────────── */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-violet-400" />
                    What We Did (Preprocessing Pipeline)
                </h3>
                <div className="space-y-2">
                    {r.preprocessing_steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-violet-500/15 text-violet-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                            </div>
                            <p className="text-sm text-slate-300">{step}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Metrics ───────────────────────────────────────────────── */}
            <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Gauge className="w-5 h-5 text-emerald-400" />
                    Evaluation Metrics
                    <span className="text-xs text-slate-500 font-normal ml-2">
                        (click any metric to see its explanation)
                    </span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(r.metrics).map(([id, metric]) => (
                        <MetricCard key={id} id={id} metric={metric} />
                    ))}
                </div>
            </div>

            {/* ─── Regression: Actual vs Predicted ──────────────────────── */}
            {r.task === "regression" && r.scatter && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Actual vs Predicted</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        Points closer to the diagonal line mean better predictions. A perfect
                        model would place every dot exactly on the line.
                    </p>
                    <RegressionScatter data={r.scatter as unknown as { actual: number; predicted: number }[]} />
                </div>
            )}

            {/* ─── Clustering: Elbow, silhouette, scatter ───────────────── */}
            {r.task === "clustering" && (
                <>
                    {/* Cluster info */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-semibold">Clustering Summary</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            We tested multiple cluster counts and found that{" "}
                            <strong className="text-white">{r.auto_k} clusters</strong> gave the
                            best silhouette score. You chose{" "}
                            <strong className="text-white">{r.n_clusters} clusters</strong> for
                            the final model.
                            {r.pca_components && (
                                <>
                                    {" "}Data was reduced to{" "}
                                    <strong className="text-white">{r.pca_components} PCA components</strong>{" "}
                                    explaining {r.variance_explained}% of the variance.
                                </>
                            )}
                        </p>
                    </div>

                    {/* Charts */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {r.elbow && r.elbow.length > 0 && (
                            <div className="glass-card p-6">
                                <h4 className="text-sm font-semibold text-slate-300 mb-3">Elbow Method</h4>
                                <p className="text-xs text-slate-500 mb-3">
                                    The "elbow" is where adding more clusters stops being helpful.
                                </p>
                                <ElbowChart data={r.elbow} bestK={r.auto_k || 4} />
                            </div>
                        )}
                        {r.silhouette_curve && r.silhouette_curve.length > 0 && (
                            <div className="glass-card p-6">
                                <h4 className="text-sm font-semibold text-slate-300 mb-3">Silhouette Scores by k</h4>
                                <p className="text-xs text-slate-500 mb-3">
                                    Higher bars mean better‑defined clusters. The green bar is the best.
                                </p>
                                <SilhouetteChart data={r.silhouette_curve} />
                            </div>
                        )}
                    </div>

                    {/* Cluster scatter */}
                    {r.scatter && r.scatter.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold mb-2">Cluster Visualization (PCA 2D)</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Each dot is one customer. The colours show which cluster they belong to.
                                Tight, well‑separated clouds indicate strong clustering.
                            </p>
                            <ClusterScatter data={r.scatter as unknown as { x: number; y: number; cluster: number }[]} />
                        </div>
                    )}

                    {/* Cluster profiles */}
                    {r.cluster_profiles && r.cluster_profiles.length > 0 && (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold mb-4">Cluster Profiles</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Average feature values for each cluster — helping you understand what
                                makes each group unique.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left py-2 px-3 text-slate-500 font-medium">Cluster</th>
                                            <th className="text-left py-2 px-3 text-slate-500 font-medium">Size</th>
                                            {Object.keys(r.cluster_profiles[0])
                                                .filter((k) => k !== "cluster" && k !== "size")
                                                .slice(0, 6)
                                                .map((key) => (
                                                    <th key={key} className="text-left py-2 px-3 text-slate-500 font-medium truncate max-w-[120px]" title={key}>
                                                        {key.length > 14 ? key.slice(0, 14) + "…" : key}
                                                    </th>
                                                ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {r.cluster_profiles.map((profile, i) => (
                                            <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                                                <td className="py-2 px-3">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ background: CLUSTER_COLORS[(profile.cluster as number) % CLUSTER_COLORS.length] }}
                                                        />
                                                        <span className="font-medium text-white">
                                                            Cluster {profile.cluster as number}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 text-slate-300">{profile.size as number}</td>
                                                {Object.entries(profile)
                                                    .filter(([k]) => k !== "cluster" && k !== "size")
                                                    .slice(0, 6)
                                                    .map(([k, v]) => (
                                                        <td key={k} className="py-2 px-3 text-slate-400 font-mono text-xs">
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

            {/* ─── Classification: classes ──────────────────────────────── */}
            {r.task === "classification" && r.classes && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-amber-400" />
                        Classes Detected
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {r.classes.map((cls) => (
                            <span key={cls} className="badge badge-indigo">
                                {cls}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Reset ─────────────────────────────────────────────────── */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition cursor-pointer font-medium"
                >
                    <RotateCcw className="w-4 h-4" />
                    Explore Another Dataset
                </button>
            </div>
        </div>
    );
}

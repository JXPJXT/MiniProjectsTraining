"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { getRecommendation, getModels, trainModel, type TrainResult, type ModelOption } from "@/lib/api";
import { useState, useEffect } from "react";
import {
    Loader2, AlertCircle, Zap, Settings, ArrowRight, Brain,
    ChevronDown, Info, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    slug: string;
    onTrainDone: (r: TrainResult) => void;
}

export default function TrainStep({ slug, onTrainDone }: Props) {
    const [task, setTask] = useState<string>("");
    const [model, setModel] = useState<string>("");
    const [nClusters, setNClusters] = useState<number>(0);
    const [progress, setProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState("");

    // Fetch recommendation
    const recQuery = useQuery({
        queryKey: ["recommend", slug],
        queryFn: () => getRecommendation(slug),
    });

    // Fetch models
    const modelsQuery = useQuery({
        queryKey: ["models"],
        queryFn: getModels,
    });

    // Set defaults when recommendation loads
    useEffect(() => {
        if (recQuery.data && !task) {
            setTask(recQuery.data.recommended_task);
        }
    }, [recQuery.data, task]);

    useEffect(() => {
        if (modelsQuery.data && task && !model) {
            const list = modelsQuery.data[task] || [];
            if (list.length > 0) setModel(list[0].id);
        }
    }, [modelsQuery.data, task, model]);

    // Training mutation
    const trainMut = useMutation({
        mutationFn: () => {
            setProgress(0);
            setStatusMsg("Sending request to backend…");

            // Simulated progress
            const interval = setInterval(() => {
                setProgress((p) => {
                    if (p >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    const messages = [
                        "Preprocessing data…",
                        "Encoding features…",
                        "Fitting model…",
                        "Computing metrics…",
                        "Generating explanations…",
                    ];
                    const idx = Math.min(Math.floor(p / 20), messages.length - 1);
                    setStatusMsg(messages[idx]);
                    return p + Math.random() * 8;
                });
            }, 400);

            return trainModel({
                dataset: slug,
                task,
                model,
                n_clusters: task === "clustering" ? nClusters || undefined : undefined,
            }).finally(() => {
                clearInterval(interval);
                setProgress(100);
                setStatusMsg("Training complete!");
            });
        },
        onSuccess: (data) => {
            setTimeout(() => onTrainDone(data), 600);
        },
    });

    const isLoading = recQuery.isLoading || modelsQuery.isLoading;
    const isTraining = trainMut.isPending;

    if (isLoading)
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <span className="ml-3 text-slate-400">Loading recommendations…</span>
            </div>
        );

    const rec = recQuery.data;
    const models = modelsQuery.data;
    const availableModels: ModelOption[] = models?.[task] || [];

    return (
        <div className="animate-fade-in-up space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold mb-1">
                    Recommend &{" "}
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Train
                    </span>
                </h2>
                <p className="text-slate-400 text-sm">
                    We&apos;ve analysed the data and have a recommendation. You can override any choice below.
                </p>
            </div>

            {/* ─── Recommendation Card ──────────────────────────────────── */}
            {rec && (
                <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">
                                Recommended task:{" "}
                                <span className="text-emerald-400 capitalize">{rec.recommended_task}</span>
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{rec.reason}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Config Panel ─────────────────────────────────────────── */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                    <Settings className="w-5 h-5 text-indigo-400" />
                    Training Configuration
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Task selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            ML Task
                        </label>
                        <div className="relative">
                            <select
                                value={task}
                                onChange={(e) => {
                                    setTask(e.target.value);
                                    setModel("");
                                }}
                                disabled={isTraining}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer focus:border-indigo-500/50 focus:outline-none transition disabled:opacity-50"
                            >
                                <option value="classification">Classification</option>
                                <option value="regression">Regression</option>
                                <option value="clustering">Clustering</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                        {task !== rec?.recommended_task && (
                            <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                                <Info className="w-3 h-3" /> You&apos;ve overridden the recommendation
                            </p>
                        )}
                    </div>

                    {/* Model selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Model
                        </label>
                        <div className="relative">
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                disabled={isTraining}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer focus:border-indigo-500/50 focus:outline-none transition disabled:opacity-50"
                            >
                                {availableModels.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* n_clusters for clustering */}
                    {task === "clustering" && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Number of Clusters (0 = auto)
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={15}
                                value={nClusters}
                                onChange={(e) => setNClusters(Number(e.target.value))}
                                disabled={isTraining}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 focus:outline-none transition disabled:opacity-50"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Leave at 0 to let the system pick the optimal cluster count.
                            </p>
                        </div>
                    )}
                </div>

                {/* ─── Preprocessing preview ──────────────────────────────── */}
                <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                        <Layers className="w-4 h-4 text-violet-400" />
                        What will happen during preprocessing
                    </h4>
                    <ul className="space-y-1.5">
                        {[
                            "Handle missing values (median for numbers, most‑frequent for categories)",
                            task === "clustering" ? "Apply log transform to skewed features" : null,
                            task === "clustering" ? "Apply PCA (retaining 95% variance)" : null,
                            task !== "clustering" ? "One‑hot encode categorical features" : null,
                            "Standardize / scale numeric features",
                            task !== "clustering" ? "Split data 80% train / 20% test" : null,
                        ]
                            .filter(Boolean)
                            .map((step, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    {step}
                                </li>
                            ))}
                    </ul>
                </div>

                {/* ─── Train Button ───────────────────────────────────────── */}
                <div className="mt-8">
                    {trainMut.isError && (
                        <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {(trainMut.error as Error).message}
                        </div>
                    )}

                    {!isTraining ? (
                        <button
                            onClick={() => trainMut.mutate()}
                            disabled={!model || !task}
                            className="flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-40 cursor-pointer"
                        >
                            <Zap className="w-5 h-5" />
                            Train Model
                        </button>
                    ) : (
                        <div className="space-y-3">
                            {/* Progress bar */}
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin flex-shrink-0" />
                                <span className="text-sm text-emerald-300 font-medium">{statusMsg}</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full progress-stripe transition-all duration-300"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                Training in progress — please don&apos;t close this page.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

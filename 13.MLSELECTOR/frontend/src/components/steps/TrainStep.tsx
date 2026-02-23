"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
    getRecommendation, getModels, trainModel,
    type TrainResult, type ModelOption,
} from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import {
    Loader2, AlertCircle, Play, ChevronDown,
    Sparkles, Settings2, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    slug: string;
    onResults: (r: TrainResult) => void;
}

export default function TrainStep({ slug, onResults }: Props) {
    const { data: rec, isLoading: recLoading } = useQuery({
        queryKey: ["recommend", slug],
        queryFn: () => getRecommendation(slug),
    });

    const { data: models, isLoading: modelsLoading } = useQuery({
        queryKey: ["models"],
        queryFn: getModels,
    });

    const [task, setTask] = useState("");
    const [model, setModel] = useState("");
    const [nClusters, setNClusters] = useState(4);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (rec && !task) {
            setTask(rec.recommended_task);
        }
    }, [rec, task]);

    useEffect(() => {
        if (models && task) {
            const available = models[task] as ModelOption[] | undefined;
            if (available && available.length > 0) {
                setModel(available[0].id);
            }
        }
    }, [models, task]);

    const mutation = useMutation({
        mutationFn: trainModel,
        onSuccess: (data) => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setProgress(100);
            setTimeout(() => onResults(data), 400);
        },
        onError: () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setProgress(0);
        },
    });

    const handleTrain = () => {
        setProgress(5);
        intervalRef.current = setInterval(() => {
            setProgress((p) => Math.min(p + Math.random() * 8, 92));
        }, 300);
        mutation.mutate({ dataset: slug, task, model, n_clusters: task === "clustering" ? nClusters : undefined });
    };

    if (recLoading || modelsLoading)
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
                <p className="text-white/30 text-sm">Analyzing dataset for recommendations…</p>
            </div>
        );

    const availableModels = models?.[task] as ModelOption[] | undefined;

    return (
        <div className="animate-fade-in-up space-y-8 max-w-2xl mx-auto">
            {/* Title */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">Configure & Train</h2>
                <p className="text-white/30 text-sm">Choose your task, pick a model, and hit train.</p>
            </div>

            {/* Recommendation */}
            {rec && (
                <div className="glass-card p-5 border-l-2 border-l-white/20">
                    <div className="flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-white/50 mb-1">
                                <span className="text-white/70 font-medium">Recommended:</span>{" "}
                                <span className="capitalize">{rec.recommended_task}</span>
                            </p>
                            <p className="text-xs text-white/25 leading-relaxed">{rec.reason}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Selector */}
            <div className="space-y-2">
                <label className="text-[10px] text-white/25 uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Settings2 className="w-3 h-3" />
                    Task
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {["classification", "regression", "clustering"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTask(t)}
                            className={cn(
                                "py-2.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer border",
                                task === t
                                    ? "bg-white text-black border-white"
                                    : "bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Model Selector */}
            {availableModels && (
                <div className="space-y-2">
                    <label className="text-[10px] text-white/25 uppercase tracking-wider font-medium flex items-center gap-1.5">
                        <Zap className="w-3 h-3" />
                        Model
                    </label>
                    <div className="relative">
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white/70 appearance-none cursor-pointer focus:outline-none focus:border-white/20 transition"
                        >
                            {availableModels.map((m: ModelOption) => (
                                <option key={m.id} value={m.id} className="bg-[#111] text-white/70">
                                    {m.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Cluster count */}
            {task === "clustering" && (
                <div className="space-y-2">
                    <label className="text-[10px] text-white/25 uppercase tracking-wider font-medium">
                        Number of Clusters
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min={2}
                            max={10}
                            value={nClusters}
                            onChange={(e) => setNClusters(+e.target.value)}
                            className="flex-1 accent-white h-1"
                        />
                        <span className="w-8 text-center text-sm font-bold text-white/70 bg-white/[0.04] py-1 rounded-md border border-white/[0.06]">
                            {nClusters}
                        </span>
                    </div>
                    <p className="text-[10px] text-white/15">
                        Leave as-is to use the auto-detected optimal K via silhouette analysis
                    </p>
                </div>
            )}

            {/* Train Button */}
            <div>
                <button
                    onClick={handleTrain}
                    disabled={mutation.isPending || !model}
                    className={cn(
                        "w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
                        mutation.isPending
                            ? "bg-white/10 text-white/50"
                            : "bg-white text-black hover:bg-white/90"
                    )}
                >
                    {mutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Training…
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Train Model
                        </>
                    )}
                </button>

                {/* Progress */}
                {mutation.isPending && (
                    <div className="mt-3">
                        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white/30 rounded-full transition-all duration-300 progress-stripe"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-white/20 mt-1.5 text-center">
                            {progress < 30 ? "Preprocessing data…" : progress < 70 ? "Fitting model…" : "Computing metrics…"}
                        </p>
                    </div>
                )}
            </div>

            {/* Error */}
            {mutation.isError && (
                <div className="flex items-center gap-2 text-red-400/70 text-sm p-4 glass-card border-l-2 border-l-red-500/30">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{(mutation.error as Error).message}</span>
                </div>
            )}
        </div>
    );
}

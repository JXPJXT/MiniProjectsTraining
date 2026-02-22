"use client";

import { useQuery } from "@tanstack/react-query";
import { getDatasets, type DatasetSummary } from "@/lib/api";
import { CreditCard, Home, Package, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
    "credit-card": <CreditCard className="w-8 h-8" />,
    home: <Home className="w-8 h-8" />,
    backpack: <Package className="w-8 h-8" />,
};

const GRADIENTS: Record<string, string> = {
    creditcard: "from-violet-500/20 to-purple-600/20",
    london: "from-cyan-500/20 to-blue-600/20",
    backpack: "from-amber-500/20 to-orange-600/20",
};

const BORDER_COLORS: Record<string, string> = {
    creditcard: "hover:border-violet-500/40",
    london: "hover:border-cyan-500/40",
    backpack: "hover:border-amber-500/40",
};

const ICON_BG: Record<string, string> = {
    creditcard: "bg-violet-500/20 text-violet-400",
    london: "bg-cyan-500/20 text-cyan-400",
    backpack: "bg-amber-500/20 text-amber-400",
};

const TASK_BADGE: Record<string, { label: string; cls: string }> = {
    clustering: { label: "Unsupervised Clustering", cls: "badge-indigo" },
    regression: { label: "Regression", cls: "badge-emerald" },
    classification: { label: "Classification", cls: "badge-amber" },
};

interface Props {
    onSelect: (slug: string, name: string) => void;
}

export default function DatasetSelector({ onSelect }: Props) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["datasets"],
        queryFn: getDatasets,
    });

    if (isLoading)
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <span className="ml-3 text-slate-400">Loading available datasets…</span>
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center py-32 text-rose-400 gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>Failed to load datasets. Is the backend running?</span>
            </div>
        );

    return (
        <div className="animate-fade-in-up">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">
                    Choose Your <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Dataset</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Each dataset comes with its own story and machine‑learning challenge.
                    Pick one and we&apos;ll walk you through the entire exploration process,
                    step by step.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {data?.map((ds: DatasetSummary) => {
                    const badge = TASK_BADGE[ds.task_hint] || TASK_BADGE.classification;
                    return (
                        <button
                            key={ds.slug}
                            onClick={() => onSelect(ds.slug, ds.name)}
                            className={cn(
                                "glass-card p-8 text-left group cursor-pointer",
                                `bg-gradient-to-br ${GRADIENTS[ds.slug] || ""}`,
                                BORDER_COLORS[ds.slug]
                            )}
                        >
                            {/* Icon */}
                            <div
                                className={cn(
                                    "w-14 h-14 rounded-xl flex items-center justify-center mb-5",
                                    ICON_BG[ds.slug] || "bg-indigo-500/20 text-indigo-400"
                                )}
                            >
                                {ICONS[ds.icon] || <Package className="w-8 h-8" />}
                            </div>

                            {/* Badge */}
                            <span className={cn("badge mb-4", badge.cls)}>
                                {badge.label}
                            </span>

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-200 transition">
                                {ds.name}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {ds.description}
                            </p>

                            {/* CTA hint */}
                            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition">
                                <span>Explore this dataset</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { getDatasets, type DatasetSummary } from "@/lib/api";
import { CreditCard, Home, Package, Loader2, AlertCircle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
    "credit-card": <CreditCard className="w-6 h-6" />,
    home: <Home className="w-6 h-6" />,
    backpack: <Package className="w-6 h-6" />,
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
                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                <span className="ml-3 text-white/40 text-sm">Loading datasets…</span>
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center py-32 text-red-400 gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">Failed to load datasets. Is the backend running on port 8000?</span>
            </div>
        );

    return (
        <div className="animate-fade-in-up">
            <div className="text-center mb-14">
                <h2 className="text-3xl font-bold mb-3 tracking-tight">
                    Select a Dataset
                </h2>
                <p className="text-white/40 max-w-xl mx-auto text-sm leading-relaxed">
                    Pick any dataset below. You&apos;ll be able to choose any ML task —
                    classification, regression, or clustering — regardless of the dataset.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
                {data?.map((ds: DatasetSummary) => (
                    <button
                        key={ds.slug}
                        onClick={() => onSelect(ds.slug, ds.name)}
                        className={cn(
                            "glass-card p-7 text-left group cursor-pointer relative overflow-hidden",
                            "hover:border-white/15"
                        )}
                    >
                        {/* Subtle corner accent */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.02] to-transparent rounded-bl-full" />

                        {/* Icon */}
                        <div className="w-11 h-11 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mb-5 text-white/60 group-hover:text-white/80 group-hover:bg-white/[0.08] transition-all">
                            {ICONS[ds.icon] || <Package className="w-6 h-6" />}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-semibold text-white/90 mb-2 group-hover:text-white transition tracking-tight">
                            {ds.name}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-white/35 leading-relaxed line-clamp-3">
                            {ds.description}
                        </p>

                        {/* CTA */}
                        <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-white/30 group-hover:text-white/60 transition">
                            <span>Explore</span>
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

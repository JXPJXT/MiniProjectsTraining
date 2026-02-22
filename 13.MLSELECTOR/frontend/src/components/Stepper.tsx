"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
    steps: string[];
    current: number;
    onStepClick: (i: number) => void;
    maxReached: number;
}

export default function Stepper({ steps, current, onStepClick, maxReached }: StepperProps) {
    return (
        <div className="flex items-center justify-center gap-0">
            {steps.map((label, i) => {
                const isDone = i < current;
                const isActive = i === current;
                const isClickable = i <= maxReached;

                return (
                    <div key={label} className="flex items-center">
                        {/* Step circle + label */}
                        <button
                            onClick={() => isClickable && onStepClick(i)}
                            disabled={!isClickable}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
                                isActive && "bg-indigo-500/15 border border-indigo-500/40",
                                isDone && "bg-emerald-500/10 border border-emerald-500/30",
                                !isActive && !isDone && "border border-transparent",
                                isClickable ? "cursor-pointer hover:bg-white/5" : "cursor-default opacity-50"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                    isActive && "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30",
                                    isDone && "bg-emerald-500 text-white",
                                    !isActive && !isDone && "bg-slate-700/60 text-slate-400"
                                )}
                            >
                                {isDone ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                            <span
                                className={cn(
                                    "text-sm font-medium hidden sm:inline",
                                    isActive && "text-indigo-300",
                                    isDone && "text-emerald-400",
                                    !isActive && !isDone && "text-slate-500"
                                )}
                            >
                                {label}
                            </span>
                        </button>

                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <div className="w-8 md:w-16 h-px mx-1">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-500",
                                        i < current
                                            ? "bg-gradient-to-r from-emerald-500 to-indigo-500"
                                            : "bg-slate-700/40"
                                    )}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

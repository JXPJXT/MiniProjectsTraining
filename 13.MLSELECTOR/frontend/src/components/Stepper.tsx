"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
    steps: string[];
    current: number;
}

export default function Stepper({ steps, current }: Props) {
    return (
        <div className="flex items-center justify-center gap-0 max-w-2xl mx-auto">
            {steps.map((label, i) => {
                const isDone = i < current;
                const isActive = i === current;

                return (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                        {/* Step indicator */}
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-300 border",
                                    isDone && "bg-white text-black border-white",
                                    isActive && "bg-white/10 text-white border-white/30",
                                    !isDone && !isActive && "bg-transparent text-white/20 border-white/[0.08]"
                                )}
                            >
                                {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : i + 1}
                            </div>
                            <span
                                className={cn(
                                    "text-[10px] font-medium tracking-wide uppercase transition-colors whitespace-nowrap",
                                    isDone && "text-white/60",
                                    isActive && "text-white/90",
                                    !isDone && !isActive && "text-white/20"
                                )}
                            >
                                {label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <div className="flex-1 mx-3 mt-[-14px]">
                                <div className="h-px bg-white/[0.06] relative">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-white/30 transition-all duration-500"
                                        style={{ width: isDone ? "100%" : "0%" }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

"use client";

import { useState, useCallback } from "react";
import Stepper from "@/components/Stepper";
import DatasetSelector from "@/components/steps/DatasetSelector";
import AnalyzeStep from "@/components/steps/AnalyzeStep";
import TrainStep from "@/components/steps/TrainStep";
import ResultsStep from "@/components/steps/ResultsStep";
import { type TrainResult } from "@/lib/api";
import { Brain } from "lucide-react";

const STEPS = ["Choose Data", "Analyze", "Train", "Results"];

export default function Home() {
  const [step, setStep] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [trainResults, setTrainResults] = useState<TrainResult | null>(null);

  const handleSelectDataset = useCallback((slug: string, name: string) => {
    setSelectedSlug(slug);
    setSelectedName(name);
    setStep(1);
  }, []);

  const handleReset = useCallback(() => {
    setStep(0);
    setSelectedSlug(null);
    setSelectedName("");
    setTrainResults(null);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.04] bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-white/[0.06] flex items-center justify-center">
              <Brain className="w-4 h-4 text-white/70" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white/80">
              ML Insight Explorer
            </span>
          </div>
          {selectedName && (
            <span className="text-xs text-white/25 hidden sm:block">
              {selectedName}
            </span>
          )}
        </div>
      </header>

      {/* ─── Stepper ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <Stepper steps={STEPS} current={step} />
      </div>

      {/* ─── Content ─────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {step === 0 && <DatasetSelector onSelect={handleSelectDataset} />}

        {step === 1 && selectedSlug && (
          <AnalyzeStep slug={selectedSlug} onContinue={() => setStep(2)} />
        )}

        {step === 2 && selectedSlug && (
          <TrainStep
            slug={selectedSlug}
            onResults={(r: TrainResult) => {
              setTrainResults(r);
              setStep(3);
            }}
          />
        )}

        {step === 3 && trainResults && (
          <ResultsStep results={trainResults} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}

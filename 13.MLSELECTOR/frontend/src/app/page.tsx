"use client";

import { useState } from "react";
import Stepper from "@/components/Stepper";
import DatasetSelector from "@/components/steps/DatasetSelector";
import AnalyzeStep from "@/components/steps/AnalyzeStep";
import TrainStep from "@/components/steps/TrainStep";
import ResultsStep from "@/components/steps/ResultsStep";
import type { TrainResult } from "@/lib/api";
import { Sparkles } from "lucide-react";

const STEPS = ["Choose Data", "Analyze", "Recommend & Train", "Results"];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [datasetName, setDatasetName] = useState<string>("");
  const [results, setResults] = useState<TrainResult | null>(null);

  const handleSelectDataset = (slug: string, name: string) => {
    setSelectedDataset(slug);
    setDatasetName(name);
    setCurrentStep(1);
  };

  const handleAnalysisDone = () => {
    setCurrentStep(2);
  };

  const handleTrainDone = (result: TrainResult) => {
    setResults(result);
    setCurrentStep(3);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedDataset(null);
    setDatasetName("");
    setResults(null);
  };

  return (
    <div className="min-h-screen">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header className="border-b border-white/5 bg-[#0d1121]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                ML Insight Explorer
              </h1>
              <p className="text-xs text-slate-500">
                Interactive Machine Learning Platform
              </p>
            </div>
          </div>

          {selectedDataset && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-sm text-indigo-300 font-medium">
                You have selected:{" "}
                <span className="text-indigo-200 font-semibold">
                  {datasetName}
                </span>
              </span>
            </div>
          )}

          {currentStep > 0 && (
            <button
              onClick={handleReset}
              className="text-sm text-slate-400 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      {/* ─── Stepper ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <Stepper steps={STEPS} current={currentStep} onStepClick={setCurrentStep} maxReached={currentStep} />
      </div>

      {/* ─── Content ─────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        {currentStep === 0 && (
          <DatasetSelector onSelect={handleSelectDataset} />
        )}
        {currentStep === 1 && selectedDataset && (
          <AnalyzeStep slug={selectedDataset} onContinue={handleAnalysisDone} />
        )}
        {currentStep === 2 && selectedDataset && (
          <TrainStep slug={selectedDataset} onTrainDone={handleTrainDone} />
        )}
        {currentStep === 3 && results && (
          <ResultsStep results={results} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}

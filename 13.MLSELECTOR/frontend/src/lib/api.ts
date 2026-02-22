const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || "API error");
    }
    return res.json();
}

/* ─── Dataset endpoints ───────────────────────────────────────────────────── */

export interface DatasetSummary {
    slug: string;
    name: string;
    description: string;
    task_hint: string;
    icon: string;
}

export interface DatasetInfo {
    slug: string;
    name: string;
    description: string;
    task_hint: string;
    target: string | null;
    columns: string[];
    dtypes: Record<string, string>;
    preview: Record<string, unknown>[];
}

export const getDatasets = () => fetchJSON<DatasetSummary[]>("/datasets/");

export const getDatasetInfo = (slug: string) =>
    fetchJSON<DatasetInfo>(`/datasets/${slug}/info`);

export const getRecommendation = (slug: string) =>
    fetchJSON<{
        recommended_task: string;
        target: string | null;
        reason: string;
        available_overrides: string[];
    }>(`/datasets/${slug}/recommend`);

/* ─── EDA endpoint ────────────────────────────────────────────────────────── */

export interface ColumnDetail {
    name: string;
    dtype: string;
    missing: number;
    missing_pct: number;
    unique: number;
    stats?: Record<string, number | null>;
    histogram?: { bins: number[]; counts: number[] };
    boxplot?: { min: number; q1: number; median: number; q3: number; max: number; outliers: number[] };
    top_values?: Record<string, number>;
}

export interface EDAResult {
    dataset: string;
    slug: string;
    shape: { rows: number; cols: number };
    duplicates: number;
    columns: ColumnDetail[];
    correlation: { columns: string[]; values: number[][] } | null;
    insights: string[];
    numeric_columns: string[];
    categorical_columns: string[];
}

export const getEDA = (slug: string) => fetchJSON<EDAResult>(`/eda/${slug}`);

/* ─── Training endpoints ──────────────────────────────────────────────────── */

export interface ModelOption {
    id: string;
    name: string;
}

export const getModels = () =>
    fetchJSON<Record<string, ModelOption[]>>("/training/models");

export interface MetricDetail {
    value: number | null;
    name: string;
    explanation: string;
    good_range: string;
    why_care: string;
}

export interface TrainResult {
    task: string;
    model_name: string;
    model_key: string;
    preprocessing_steps: string[];
    metrics: Record<string, MetricDetail>;
    training_time_seconds: number;
    train_size?: number;
    test_size?: number;
    feature_count?: number;
    classes?: string[];
    // regression scatter
    scatter?: Record<string, number>[];
    // clustering
    n_clusters?: number;
    auto_k?: number;
    elbow?: { k: number; inertia: number }[];
    silhouette_curve?: { k: number; score: number }[];
    cluster_profiles?: Record<string, unknown>[];
    pca_components?: number;
    variance_explained?: number;
    data_points?: number;
}

export const trainModel = (body: {
    dataset: string;
    task: string;
    model: string;
    n_clusters?: number;
}) =>
    fetchJSON<TrainResult>("/training/train", {
        method: "POST",
        body: JSON.stringify(body),
    });

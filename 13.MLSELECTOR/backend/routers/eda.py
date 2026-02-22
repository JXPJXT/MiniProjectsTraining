"""
eda router — Exploratory Data Analysis computations.
Returns shape, dtypes, missing values, duplicates, summary statistics,
chart data (histograms, box‑plots, correlations), and auto‑generated insights.
"""

import os, math, json
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from routers.datasets import DATASETS, _resolve

router = APIRouter()


def _load_primary(slug: str) -> pd.DataFrame:
    meta = DATASETS[slug]
    primary = meta["files"].get("data") or meta["files"].get("train")
    return pd.read_csv(_resolve(primary))


# ─── helpers ──────────────────────────────────────────────────────────────────

def _safe(v):
    """Make a value JSON‑safe (handle NaN / Inf)."""
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    return v


def _series_stats(s: pd.Series):
    """Descriptive stats for a numeric series."""
    desc = s.describe()
    return {k: _safe(v) for k, v in desc.to_dict().items()}


def _histogram_data(s: pd.Series, bins: int = 30):
    """Return histogram bin edges and counts."""
    s_clean = s.dropna()
    if len(s_clean) == 0:
        return {"bins": [], "counts": []}
    counts, edges = np.histogram(s_clean, bins=bins)
    return {
        "bins": [round(float(e), 4) for e in edges],
        "counts": [int(c) for c in counts],
    }


def _boxplot_data(s: pd.Series):
    """Return quartile data for a box plot."""
    s_clean = s.dropna()
    if len(s_clean) == 0:
        return None
    q1, med, q3 = float(s_clean.quantile(0.25)), float(s_clean.median()), float(s_clean.quantile(0.75))
    iqr = q3 - q1
    lower = float(max(s_clean.min(), q1 - 1.5 * iqr))
    upper = float(min(s_clean.max(), q3 + 1.5 * iqr))
    outliers = s_clean[(s_clean < lower) | (s_clean > upper)].tolist()[:50]  # cap
    return {"min": lower, "q1": q1, "median": med, "q3": q3, "max": upper, "outliers": outliers}


def _correlation_matrix(df: pd.DataFrame):
    """Correlation matrix for numeric columns."""
    num = df.select_dtypes(include="number")
    if num.shape[1] < 2:
        return None
    corr = num.corr()
    return {
        "columns": corr.columns.tolist(),
        "values": [[_safe(corr.iloc[i, j]) for j in range(corr.shape[1])] for i in range(corr.shape[0])],
    }


def _generate_insights(df: pd.DataFrame, slug: str):
    """Auto‑generate 3–4 plain‑English insights about the data."""
    insights = []
    num_cols = df.select_dtypes(include="number").columns.tolist()
    cat_cols = df.select_dtypes(include="object").columns.tolist()

    # 1. Shape insight
    insights.append(
        f"The dataset has **{df.shape[0]:,}** rows and **{df.shape[1]}** columns. "
        f"That's a {'decent' if df.shape[0] > 1000 else 'small'} amount of data to work with."
    )

    # 2. Missing values
    missing = df.isnull().sum()
    total_missing = int(missing.sum())
    if total_missing > 0:
        worst = missing.idxmax()
        pct = round(missing[worst] / len(df) * 100, 1)
        insights.append(
            f"There are **{total_missing:,}** missing values in total. "
            f"The column with the most gaps is **{worst}** ({pct}% missing). "
            "We'll handle these carefully during preprocessing."
        )
    else:
        insights.append("Great news — there are **no missing values** at all. The data is nice and clean.")

    # 3. Skewness
    if len(num_cols) > 0:
        skew = df[num_cols].skew().abs().sort_values(ascending=False)
        if len(skew) > 0 and skew.iloc[0] > 2:
            col = skew.index[0]
            insights.append(
                f"The column **{col}** is highly skewed (skewness ≈ {skew.iloc[0]:.1f}). "
                "This means a few extreme values are pulling the distribution to one side. "
                "A log transform could help the model treat these values more fairly."
            )

    # 4. Categorical dominance
    if len(cat_cols) > 0:
        col = cat_cols[0]
        top = df[col].value_counts().head(1)
        if len(top) > 0:
            val, cnt = top.index[0], int(top.iloc[0])
            pct = round(cnt / len(df) * 100, 1)
            insights.append(
                f"In the **{col}** column, the most common value is *\"{val}\"* "
                f"appearing {cnt:,} times ({pct}% of all rows)."
            )

    # 5. Correlations
    if len(num_cols) >= 2:
        corr = df[num_cols].corr().abs()
        np.fill_diagonal(corr.values, 0)
        max_corr = corr.max().max()
        if max_corr > 0.7:
            idx = np.unravel_index(corr.values.argmax(), corr.shape)
            c1, c2 = corr.columns[idx[0]], corr.columns[idx[1]]
            insights.append(
                f"**{c1}** and **{c2}** have a strong correlation ({max_corr:.2f}). "
                "This means they move together — which can sometimes cause issues "
                "called multicollinearity. Something to keep an eye on."
            )

    return insights[:4]


# ─── main EDA endpoint ───────────────────────────────────────────────────────

@router.get("/{slug}")
def run_eda(slug: str):
    if slug not in DATASETS:
        raise HTTPException(404, f"Dataset '{slug}' not found")

    df = _load_primary(slug)
    meta = DATASETS[slug]

    # Drop CUST_ID for credit card
    if slug == "creditcard" and "CUST_ID" in df.columns:
        df = df.drop(columns=["CUST_ID"])

    num_cols = df.select_dtypes(include="number").columns.tolist()
    cat_cols = df.select_dtypes(include="object").columns.tolist()

    # Build per‑column stats
    column_details = []
    for col in df.columns:
        detail = {
            "name": col,
            "dtype": str(df[col].dtype),
            "missing": int(df[col].isnull().sum()),
            "missing_pct": round(df[col].isnull().sum() / len(df) * 100, 2),
            "unique": int(df[col].nunique()),
        }
        if col in num_cols:
            detail["stats"] = _series_stats(df[col])
            detail["histogram"] = _histogram_data(df[col])
            detail["boxplot"] = _boxplot_data(df[col])
        else:
            top_values = df[col].value_counts().head(10)
            detail["top_values"] = {str(k): int(v) for k, v in top_values.items()}
        column_details.append(detail)

    return {
        "dataset": meta["name"],
        "slug": slug,
        "shape": {"rows": df.shape[0], "cols": df.shape[1]},
        "duplicates": int(df.duplicated().sum()),
        "columns": column_details,
        "correlation": _correlation_matrix(df),
        "insights": _generate_insights(df, slug),
        "numeric_columns": num_cols,
        "categorical_columns": cat_cols,
    }

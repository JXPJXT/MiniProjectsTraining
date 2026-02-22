"""
datasets router — list available datasets, return metadata, and recommend tasks.
"""

import os
import pandas as pd
from fastapi import APIRouter, HTTPException

router = APIRouter()

DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "datasets")

# ─── Dataset registry ────────────────────────────────────────────────────────
DATASETS = {
    "creditcard": {
        "name": "Credit Card Customer Segmentation",
        "slug": "creditcard",
        "description": "Segment credit‑card customers by usage behaviour. This is an unsupervised clustering problem — there is no single right answer, just patterns waiting to be found.",
        "files": {"data": "creditcard.csv"},
        "task_hint": "clustering",
        "target": None,
        "icon": "credit-card",
    },
    "london": {
        "name": "London House Prices",
        "slug": "london",
        "description": "Predict London property prices from features like location, floor area, and energy rating. A classic regression task where the goal is to get as close to the real sale price as possible.",
        "files": {"train": "londontrain.csv", "test": "londontest.csv"},
        "task_hint": "regression",
        "target": "price",
        "icon": "home",
    },
    "backpack": {
        "name": "Backpack Price Prediction",
        "slug": "backpack",
        "description": "Classify backpack price ranges based on brand, material, size, and other attributes. Even though prices are numeric, we treat this as a classification challenge.",
        "files": {"train": "backpacktrain.csv", "test": "backpacktest.csv"},
        "task_hint": "classification",
        "target": "Price",
        "icon": "backpack",
    },
}


def _resolve(filename: str) -> str:
    return os.path.normpath(os.path.join(DATASET_DIR, filename))


@router.get("/")
def list_datasets():
    """Return lightweight list of available datasets."""
    return [
        {
            "slug": d["slug"],
            "name": d["name"],
            "description": d["description"],
            "task_hint": d["task_hint"],
            "icon": d["icon"],
        }
        for d in DATASETS.values()
    ]


@router.get("/{slug}/info")
def dataset_info(slug: str):
    """Return detailed info including column names, shape, and dtypes."""
    if slug not in DATASETS:
        raise HTTPException(404, f"Dataset '{slug}' not found")

    meta = DATASETS[slug]
    primary_file = meta["files"].get("data") or meta["files"].get("train")
    path = _resolve(primary_file)

    if not os.path.exists(path):
        raise HTTPException(500, f"File not found at {path}")

    df = pd.read_csv(path, nrows=5)
    return {
        **meta,
        "columns": df.columns.tolist(),
        "dtypes": {c: str(df[c].dtype) for c in df.columns},
        "preview": df.head(5).to_dict(orient="records"),
    }


@router.get("/{slug}/recommend")
def recommend_task(slug: str):
    """Automatically infer the recommended ML task and explain why."""
    if slug not in DATASETS:
        raise HTTPException(404, f"Dataset '{slug}' not found")

    meta = DATASETS[slug]
    target = meta["target"]
    task = meta["task_hint"]

    if task == "clustering":
        reason = (
            "This dataset has no labelled target column, so supervised learning "
            "doesn't apply here. Instead, we'll use unsupervised clustering to "
            "discover natural groupings among customers based on their credit‑card "
            "usage patterns."
        )
    elif task == "regression":
        reason = (
            f"The target column '{target}' contains continuous numeric values "
            "(house prices in GBP), making this a regression problem. Our models "
            "will try to predict the exact price of a property."
        )
    else:
        reason = (
            f"We treat the target column '{target}' as a classification problem. "
            "The model will learn to assign each item to the correct class."
        )

    return {
        "recommended_task": task,
        "target": target,
        "reason": reason,
        "available_overrides": ["classification", "regression", "clustering"],
    }

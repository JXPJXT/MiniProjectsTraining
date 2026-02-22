"""
training router — Preprocessing, model training, and evaluation.
Handles classification, regression, and clustering pipelines.
Every metric comes with a plain‑English explanation.
"""

import os, time, math, traceback
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.decomposition import PCA
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# Classification
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    classification_report,
)

# Regression
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# Clustering
from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN
from sklearn.metrics import silhouette_score, davies_bouldin_score

from routers.datasets import DATASETS, _resolve

router = APIRouter()


# ─── Request / Response models ────────────────────────────────────────────────

class TrainRequest(BaseModel):
    dataset: str                         # slug
    task: str                            # classification | regression | clustering
    model: str                           # e.g. "random_forest"
    n_clusters: Optional[int] = None     # for clustering


# ─── helpers ──────────────────────────────────────────────────────────────────

def _safe(v):
    if isinstance(v, (float, np.floating)):
        if math.isnan(v) or math.isinf(v):
            return None
        return round(float(v), 6)
    if isinstance(v, (int, np.integer)):
        return int(v)
    return v


MODEL_REGISTRY = {
    # Classification
    "logistic_regression": ("Logistic Regression", lambda: LogisticRegression(max_iter=1000, random_state=42)),
    "random_forest_clf": ("Random Forest Classifier", lambda: RandomForestClassifier(n_estimators=100, random_state=42)),
    "svm_clf": ("Support Vector Machine (SVM)", lambda: SVC(probability=True, random_state=42)),
    "gradient_boosting_clf": ("Gradient Boosting Classifier", lambda: GradientBoostingClassifier(n_estimators=100, random_state=42)),
    # Regression
    "linear_regression": ("Linear Regression", lambda: LinearRegression()),
    "random_forest_reg": ("Random Forest Regressor", lambda: RandomForestRegressor(n_estimators=100, random_state=42)),
    "svr": ("Support Vector Regressor", lambda: SVR()),
    "gradient_boosting_reg": ("Gradient Boosting Regressor", lambda: GradientBoostingRegressor(n_estimators=100, random_state=42)),
    # Clustering
    "kmeans": ("KMeans", None),
    "agglomerative": ("Agglomerative Clustering", None),
    "dbscan": ("DBSCAN", None),
}


# ─── metric explainers ───────────────────────────────────────────────────────

METRIC_EXPLANATIONS = {
    # Classification
    "accuracy": {
        "name": "Accuracy",
        "explanation": (
            "Accuracy tells you what fraction of all predictions the model got right. "
            "Think of it like a quiz score — if you answered 85 out of 100 questions "
            "correctly, your accuracy is 85%. It's easy to understand, but it can be "
            "misleading when classes are imbalanced (e.g., 95% of data belongs to one "
            "class). A score above 0.80 is generally good, but always look at other "
            "metrics too."
        ),
        "good_range": "0.80 – 1.00",
        "why_care": "It's the simplest way to gauge overall model performance.",
    },
    "precision": {
        "name": "Precision",
        "explanation": (
            "Precision answers the question: 'Of all the items the model labelled "
            "as positive, how many actually were positive?' Imagine a spam filter — "
            "precision measures how often a flagged email is actually spam. High "
            "precision means few false alarms. A value above 0.75 is solid."
        ),
        "good_range": "0.75 – 1.00",
        "why_care": "Important when false positives are costly (e.g., flagging a legitimate transaction as fraud).",
    },
    "recall": {
        "name": "Recall",
        "explanation": (
            "Recall (also called sensitivity) answers: 'Of all the truly positive "
            "items, how many did the model actually catch?' Going back to spam — "
            "recall measures how much real spam actually ends up in your spam folder. "
            "High recall means you're not missing many positives. Aim for 0.70+ in "
            "most cases."
        ),
        "good_range": "0.70 – 1.00",
        "why_care": "Crucial when missing a positive case is dangerous (e.g., failing to detect disease).",
    },
    "f1_score": {
        "name": "F1 Score",
        "explanation": (
            "F1 is the harmonic mean of Precision and Recall — it balances both into "
            "a single number. It's especially useful when you can't afford to ignore "
            "either false positives or false negatives. Think of it as a 'balanced "
            "report card'. Above 0.70 is a good starting point."
        ),
        "good_range": "0.70 – 1.00",
        "why_care": "Best single metric when class distribution is uneven.",
    },
    "roc_auc": {
        "name": "ROC AUC",
        "explanation": (
            "AUC stands for Area Under the ROC Curve. It measures how well the "
            "model separates classes across all possible thresholds. An AUC of 0.5 "
            "means the model is no better than flipping a coin; 1.0 means perfect "
            "separation. It's especially useful for binary classification. Anything "
            "above 0.75 means the model has learned real patterns."
        ),
        "good_range": "0.75 – 1.00",
        "why_care": "Threshold‑independent measure of class separation ability.",
    },
    # Regression
    "mse": {
        "name": "Mean Squared Error (MSE)",
        "explanation": (
            "MSE calculates the average of the squared differences between predicted "
            "and actual values. The squaring punishes large errors harshly — one big "
            "mistake weighs a lot more than many small ones. Lower is better, but the "
            "number itself depends on the scale of your target. Use it to compare "
            "models, not as a standalone number."
        ),
        "good_range": "Lower is better (scale‑dependent)",
        "why_care": "Penalises large errors more than small ones, guiding the model to avoid big misses.",
    },
    "rmse": {
        "name": "Root Mean Squared Error (RMSE)",
        "explanation": (
            "RMSE is just the square root of MSE. The nice thing? It's in the same "
            "units as your target — so if you're predicting house prices in pounds, "
            "RMSE tells you roughly how many pounds off the prediction typically is. "
            "It's one of the most intuitive regression metrics."
        ),
        "good_range": "Lower is better (same unit as target)",
        "why_care": "Easy to interpret because it shares units with the predicted value.",
    },
    "mae": {
        "name": "Mean Absolute Error (MAE)",
        "explanation": (
            "MAE is the average of the absolute differences between predictions and "
            "actual values. Unlike MSE, it treats all errors equally — a £100 miss "
            "is twice as bad as a £50 miss, not four times. It's robust to outliers "
            "and easy to explain to non‑technical people."
        ),
        "good_range": "Lower is better (same unit as target)",
        "why_care": "More robust than MSE to occasional large errors.",
    },
    "r_squared": {
        "name": "R² (R‑Squared)",
        "explanation": (
            "R² tells you what percentage of the target's variability your model "
            "explains. An R² of 0.85 means the model captures 85% of the patterns "
            "in the data. A value of 1.0 is perfect, and 0.0 means the model is no "
            "better than simply predicting the average every time. Negative values "
            "mean the model is actively harmful."
        ),
        "good_range": "0.70 – 1.00",
        "why_care": "Shows how much of the outcome your features actually explain.",
    },
    # Clustering
    "silhouette_score": {
        "name": "Silhouette Score",
        "explanation": (
            "The silhouette score measures how similar each data point is to its own "
            "cluster compared to other clusters. It ranges from −1 to 1. A score near "
            "1 means clusters are dense and well‑separated — like tightly packed, "
            "non‑overlapping clouds. Near 0 means clusters overlap, and negative "
            "values suggest data points may be in the wrong cluster."
        ),
        "good_range": "0.40 – 1.00",
        "why_care": "The most popular way to judge whether your clusters are truly distinct.",
    },
    "davies_bouldin": {
        "name": "Davies‑Bouldin Index",
        "explanation": (
            "This index measures the average 'similarity' between each cluster and "
            "its closest neighbour. Lower values mean the clusters are compact and "
            "far apart — exactly what you want. Think of it as 'how easy is it to "
            "confuse two clusters?' Zero is perfect (unlikely in practice); anything "
            "under 1.0 is usually quite good."
        ),
        "good_range": "0.00 – 1.00 (lower is better)",
        "why_care": "Highlights both cluster compactness and separation in one number.",
    },
    "inertia": {
        "name": "Inertia (Within‑Cluster Sum of Squares)",
        "explanation": (
            "Inertia measures how spread out the points are within each cluster. "
            "Lower inertia means tighter clusters. However, inertia always decreases "
            "as you add more clusters — so you can't just pick the lowest value. "
            "Instead, look for the 'elbow' point where adding more clusters stops "
            "giving you meaningful improvement."
        ),
        "good_range": "Lower is better, but look for the elbow",
        "why_care": "Core building block for the elbow method of choosing cluster count.",
    },
}


# ─── Available models endpoint ───────────────────────────────────────────────

@router.get("/models")
def list_models():
    return {
        "classification": [
            {"id": "logistic_regression", "name": "Logistic Regression"},
            {"id": "random_forest_clf", "name": "Random Forest Classifier"},
            {"id": "svm_clf", "name": "Support Vector Machine"},
            {"id": "gradient_boosting_clf", "name": "Gradient Boosting Classifier"},
        ],
        "regression": [
            {"id": "linear_regression", "name": "Linear Regression"},
            {"id": "random_forest_reg", "name": "Random Forest Regressor"},
            {"id": "svr", "name": "Support Vector Regressor"},
            {"id": "gradient_boosting_reg", "name": "Gradient Boosting Regressor"},
        ],
        "clustering": [
            {"id": "kmeans", "name": "KMeans"},
            {"id": "agglomerative", "name": "Agglomerative Clustering"},
            {"id": "dbscan", "name": "DBSCAN"},
        ],
    }


# ─── MAIN TRAINING ENDPOINT ──────────────────────────────────────────────────

@router.post("/train")
def train_model(req: TrainRequest):
    if req.dataset not in DATASETS:
        raise HTTPException(404, "Dataset not found")

    start = time.time()
    meta = DATASETS[req.dataset]

    try:
        if req.task == "clustering":
            result = _train_clustering(req, meta)
        elif req.task == "regression":
            result = _train_regression(req, meta)
        elif req.task == "classification":
            result = _train_classification(req, meta)
        else:
            raise HTTPException(400, f"Unknown task: {req.task}")
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Training failed: {str(e)}")

    elapsed = round(time.time() - start, 2)
    result["training_time_seconds"] = elapsed
    return result


# ═══════════════════════════════════════════════════════════════════════════════
#  CLASSIFICATION PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════

def _train_classification(req: TrainRequest, meta: dict):
    train_df = pd.read_csv(_resolve(meta["files"]["train"]))
    target_col = meta["target"]

    # Drop ID columns
    id_cols = [c for c in train_df.columns if c.lower() in ("id", "cust_id")]
    train_df = train_df.drop(columns=id_cols, errors="ignore")

    if target_col not in train_df.columns:
        raise HTTPException(400, f"Target column '{target_col}' not found")

    # --- For backpack: bin the price into classes ---
    y_raw = train_df[target_col]
    if req.dataset == "backpack":
        # Create price bins for classification
        bins = pd.qcut(y_raw, q=4, labels=["Budget", "Economy", "Mid-Range", "Premium"], duplicates="drop")
        y = bins.astype(str)
    elif y_raw.dtype == "object" or y_raw.nunique() < 20:
        y = y_raw.astype(str)
    else:
        bins = pd.qcut(y_raw, q=4, labels=["Low", "Medium", "High", "Very High"], duplicates="drop")
        y = bins.astype(str)

    X = train_df.drop(columns=[target_col])

    # Encode target
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # Separate numeric / categorical
    num_cols = X.select_dtypes(include="number").columns.tolist()
    cat_cols = X.select_dtypes(include="object").columns.tolist()

    preprocessing_steps = []

    # Build preprocessing
    transformers = []
    if num_cols:
        transformers.append(("num", Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]), num_cols))
        preprocessing_steps.append("Imputed missing numeric values with median")
        preprocessing_steps.append("Scaled numeric features using StandardScaler")

    if cat_cols:
        transformers.append(("cat", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]), cat_cols))
        preprocessing_steps.append("Imputed missing categorical values with most frequent value")
        preprocessing_steps.append("One‑hot encoded categorical features")

    preprocessor = ColumnTransformer(transformers, remainder="drop")

    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    preprocessing_steps.append("Split data 80% train / 20% test (stratified)")

    X_train_t = preprocessor.fit_transform(X_train)
    X_test_t = preprocessor.transform(X_test)

    # Get model
    model_key = req.model
    if model_key not in MODEL_REGISTRY:
        raise HTTPException(400, f"Unknown model: {model_key}")
    model_name, model_fn = MODEL_REGISTRY[model_key]
    clf = model_fn()
    clf.fit(X_train_t, y_train)

    y_pred = clf.predict(X_test_t)

    # Metrics
    is_binary = len(le.classes_) == 2
    avg = "binary" if is_binary else "weighted"

    metrics = {}
    metrics["accuracy"] = {
        "value": _safe(accuracy_score(y_test, y_pred)),
        **METRIC_EXPLANATIONS["accuracy"],
    }
    metrics["precision"] = {
        "value": _safe(precision_score(y_test, y_pred, average=avg, zero_division=0)),
        **METRIC_EXPLANATIONS["precision"],
    }
    metrics["recall"] = {
        "value": _safe(recall_score(y_test, y_pred, average=avg, zero_division=0)),
        **METRIC_EXPLANATIONS["recall"],
    }
    metrics["f1_score"] = {
        "value": _safe(f1_score(y_test, y_pred, average=avg, zero_division=0)),
        **METRIC_EXPLANATIONS["f1_score"],
    }

    # ROC AUC (if possible)
    try:
        if is_binary and hasattr(clf, "predict_proba"):
            proba = clf.predict_proba(X_test_t)[:, 1]
            auc_val = roc_auc_score(y_test, proba)
        elif hasattr(clf, "predict_proba"):
            proba = clf.predict_proba(X_test_t)
            auc_val = roc_auc_score(y_test, proba, multi_class="ovr", average="weighted")
        else:
            auc_val = None
    except Exception:
        auc_val = None

    if auc_val is not None:
        metrics["roc_auc"] = {"value": _safe(auc_val), **METRIC_EXPLANATIONS["roc_auc"]}

    return {
        "task": "classification",
        "model_name": model_name,
        "model_key": model_key,
        "classes": le.classes_.tolist(),
        "preprocessing_steps": preprocessing_steps,
        "metrics": metrics,
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "feature_count": int(X_train_t.shape[1]),
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  REGRESSION PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════

def _train_regression(req: TrainRequest, meta: dict):
    train_df = pd.read_csv(_resolve(meta["files"]["train"]))
    target_col = meta["target"]

    id_cols = [c for c in train_df.columns if c.lower() in ("id", "cust_id")]
    train_df = train_df.drop(columns=id_cols, errors="ignore")

    # Drop non‑predictive text columns for London dataset
    drop_text = ["fullAddress", "postcode", "street"]
    train_df = train_df.drop(columns=[c for c in drop_text if c in train_df.columns], errors="ignore")

    if target_col not in train_df.columns:
        raise HTTPException(400, f"Target column '{target_col}' not found")

    y = train_df[target_col].copy()
    X = train_df.drop(columns=[target_col])

    num_cols = X.select_dtypes(include="number").columns.tolist()
    cat_cols = X.select_dtypes(include="object").columns.tolist()

    preprocessing_steps = []

    transformers = []
    if num_cols:
        transformers.append(("num", Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]), num_cols))
        preprocessing_steps.append("Imputed missing numeric values with median")
        preprocessing_steps.append("Scaled numeric features using StandardScaler")

    if cat_cols:
        transformers.append(("cat", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]), cat_cols))
        preprocessing_steps.append("Imputed missing categorical values with most frequent")
        preprocessing_steps.append("One‑hot encoded categorical features")

    preprocessor = ColumnTransformer(transformers, remainder="drop")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    preprocessing_steps.append("Split data 80% train / 20% test")

    X_train_t = preprocessor.fit_transform(X_train)
    X_test_t = preprocessor.transform(X_test)

    model_key = req.model
    if model_key not in MODEL_REGISTRY:
        raise HTTPException(400, f"Unknown model: {model_key}")
    model_name, model_fn = MODEL_REGISTRY[model_key]
    reg = model_fn()
    reg.fit(X_train_t, y_train)

    y_pred = reg.predict(X_test_t)

    mse_val = mean_squared_error(y_test, y_pred)
    metrics = {
        "mse": {"value": _safe(mse_val), **METRIC_EXPLANATIONS["mse"]},
        "rmse": {"value": _safe(np.sqrt(mse_val)), **METRIC_EXPLANATIONS["rmse"]},
        "mae": {"value": _safe(mean_absolute_error(y_test, y_pred)), **METRIC_EXPLANATIONS["mae"]},
        "r_squared": {"value": _safe(r2_score(y_test, y_pred)), **METRIC_EXPLANATIONS["r_squared"]},
    }

    # Actual vs predicted (sample for chart)
    sample_idx = np.random.RandomState(42).choice(len(y_test), size=min(200, len(y_test)), replace=False)
    y_test_arr = np.array(y_test)
    scatter = [
        {"actual": _safe(y_test_arr[i]), "predicted": _safe(y_pred[i])}
        for i in sample_idx
    ]

    return {
        "task": "regression",
        "model_name": model_name,
        "model_key": model_key,
        "preprocessing_steps": preprocessing_steps,
        "metrics": metrics,
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "feature_count": int(X_train_t.shape[1]),
        "scatter": scatter,
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  CLUSTERING PIPELINE  (Credit Card dataset)
# ═══════════════════════════════════════════════════════════════════════════════

def _train_clustering(req: TrainRequest, meta: dict):
    df = pd.read_csv(_resolve(meta["files"]["data"]))

    preprocessing_steps = []

    # Drop CUST_ID
    if "CUST_ID" in df.columns:
        df = df.drop(columns=["CUST_ID"])
        preprocessing_steps.append("Dropped CUST_ID column (non‑predictive identifier)")

    # Handle missing values per spec
    if "CREDIT_LIMIT" in df.columns:
        before = len(df)
        df = df.dropna(subset=["CREDIT_LIMIT"])
        after = len(df)
        if before != after:
            preprocessing_steps.append(f"Dropped {before - after} rows where CREDIT_LIMIT was null")

    if "MINIMUM_PAYMENTS" in df.columns:
        med = df["MINIMUM_PAYMENTS"].median()
        df["MINIMUM_PAYMENTS"] = df["MINIMUM_PAYMENTS"].fillna(med)
        preprocessing_steps.append(f"Filled MINIMUM_PAYMENTS nulls with median ({med:.2f})")

    # Fill remaining nulls
    df = df.fillna(df.median(numeric_only=True))

    # Log transform skewed columns
    skewed = df.skew().abs()
    skewed_cols = skewed[skewed > 1].index.tolist()
    for col in skewed_cols:
        df[col] = np.log1p(df[col])
    if skewed_cols:
        preprocessing_steps.append(f"Applied log(1+x) transform to skewed columns: {', '.join(skewed_cols)}")

    # Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df)
    preprocessing_steps.append("Standardised all features with StandardScaler")

    # PCA retaining 95% variance
    pca = PCA(n_components=0.95, random_state=42)
    X_pca = pca.fit_transform(X_scaled)
    n_components = X_pca.shape[1]
    variance_explained = round(sum(pca.explained_variance_ratio_) * 100, 1)
    preprocessing_steps.append(
        f"Applied PCA → kept {n_components} components explaining {variance_explained}% variance"
    )

    model_key = req.model

    # ── Elbow method (always compute for reference) ──
    max_k = min(10, len(X_pca) - 1)
    elbow_data = []
    silhouette_data = []
    for k in range(2, max_k + 1):
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X_pca)
        elbow_data.append({"k": k, "inertia": _safe(km.inertia_)})
        sil = silhouette_score(X_pca, labels)
        silhouette_data.append({"k": k, "score": _safe(sil)})

    # Auto‑pick best k via silhouette
    best_k = max(silhouette_data, key=lambda x: x["score"])["k"]
    n_clusters = req.n_clusters or best_k

    # ── Fit chosen model ──
    if model_key == "kmeans":
        model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = model.fit_predict(X_pca)
        inertia_val = _safe(model.inertia_)
    elif model_key == "agglomerative":
        model = AgglomerativeClustering(n_clusters=n_clusters)
        labels = model.fit_predict(X_pca)
        inertia_val = None
    elif model_key == "dbscan":
        model = DBSCAN(eps=1.5, min_samples=5)
        labels = model.fit_predict(X_pca)
        n_clusters = len(set(labels) - {-1})
        inertia_val = None
    else:
        raise HTTPException(400, f"Unknown clustering model: {model_key}")

    n_labels = len(set(labels) - {-1})

    # Metrics
    metrics = {}
    if n_labels >= 2:
        sil = silhouette_score(X_pca, labels)
        db = davies_bouldin_score(X_pca, labels)
        metrics["silhouette_score"] = {"value": _safe(sil), **METRIC_EXPLANATIONS["silhouette_score"]}
        metrics["davies_bouldin"] = {"value": _safe(db), **METRIC_EXPLANATIONS["davies_bouldin"]}

    if inertia_val is not None:
        metrics["inertia"] = {"value": inertia_val, **METRIC_EXPLANATIONS["inertia"]}

    # PCA 2D scatter for visualisation
    pca_2d = PCA(n_components=2, random_state=42)
    coords = pca_2d.fit_transform(X_scaled)
    scatter = [
        {"x": _safe(coords[i, 0]), "y": _safe(coords[i, 1]), "cluster": int(labels[i])}
        for i in range(len(labels))
    ]
    # Down‑sample for frontend performance
    if len(scatter) > 2000:
        rng = np.random.RandomState(42)
        idx = rng.choice(len(scatter), 2000, replace=False)
        scatter = [scatter[i] for i in sorted(idx)]

    # Cluster business insights
    cluster_profiles = []
    df_labelled = df.copy()
    df_labelled["cluster"] = labels
    for cl in sorted(set(labels)):
        if cl == -1:
            continue
        subset = df_labelled[df_labelled["cluster"] == cl]
        profile = {col: _safe(subset[col].mean()) for col in df.columns[:8]}
        profile["size"] = int(len(subset))
        profile["cluster"] = int(cl)
        cluster_profiles.append(profile)

    return {
        "task": "clustering",
        "model_name": MODEL_REGISTRY.get(model_key, (model_key,))[0],
        "model_key": model_key,
        "n_clusters": n_clusters,
        "auto_k": best_k,
        "preprocessing_steps": preprocessing_steps,
        "metrics": metrics,
        "elbow": elbow_data,
        "silhouette_curve": silhouette_data,
        "scatter": scatter,
        "cluster_profiles": cluster_profiles,
        "pca_components": n_components,
        "variance_explained": variance_explained,
        "data_points": int(len(X_pca)),
    }

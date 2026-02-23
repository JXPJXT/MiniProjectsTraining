# 🧠 ML Insight Explorer

An **interactive, educational machine learning platform** that lets you pick a real dataset, explore it visually, train models, and deeply understand every metric — all explained in plain English like a calm senior data scientist walking you through.

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3-F7931E?logo=scikitlearn)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **📊 3 Real Datasets** | Credit Card Customer Segmentation, London House Prices, Backpack Price Prediction |
| **🔍 Automated EDA** | Shape, missing values, histograms, box plots, correlation heatmap, auto-generated insights |
| **🤖 Task Recommendation** | System recommends Classification / Regression / Clustering with reasoning — user can override |
| **⚙️ Model Selection** | 12 models across 3 tasks (Logistic Regression, Random Forest, SVM, Gradient Boosting, KMeans, DBSCAN, etc.) |
| **📈 Rich Visualizations** | Actual vs Predicted scatter, Elbow method, Silhouette curves, PCA cluster scatter, Cluster profiles |
| **📝 Metric Explanations** | Every metric (Accuracy, F1, R², Silhouette Score, etc.) has a human-readable explanation, good range, and "why it matters" |
| **🔧 Preprocessing Transparency** | Every preprocessing step is listed and explained — no black boxes |
| **🎨 Premium Dark UI** | Glassmorphism, gradient cards, micro-animations, responsive design |

---

## 🏗️ Architecture

```
13.MLSELECTOR/
├── backend/                  # Python FastAPI server
│   ├── main.py               # App entry point, CORS, router mounts
│   ├── requirements.txt      # Python dependencies
│   └── routers/
│       ├── datasets.py       # Dataset registry, metadata, task recommendation
│       ├── eda.py             # Exploratory Data Analysis engine
│       └── training.py       # ML training pipelines (clf / reg / clustering)
│
├── frontend/                 # Next.js 16 + TypeScript + Tailwind v4
│   └── src/
│       ├── app/
│       │   ├── layout.tsx     # Root layout with Inter font & Providers
│       │   ├── globals.css    # Design system (tokens, glass cards, animations)
│       │   └── page.tsx       # Main page orchestrating the 4-step wizard
│       ├── components/
│       │   ├── Providers.tsx  # React Query provider
│       │   ├── Stepper.tsx    # Visual stepper with done/active/pending states
│       │   └── steps/
│       │       ├── DatasetSelector.tsx   # Step 1: Choose dataset
│       │       ├── AnalyzeStep.tsx       # Step 2: EDA dashboard
│       │       ├── TrainStep.tsx         # Step 3: Model config & training
│       │       └── ResultsStep.tsx       # Step 4: Metrics & visualizations
│       └── lib/
│           ├── api.ts         # Typed API client for all endpoints
│           └── utils.ts       # cn() utility for Tailwind merging
│
└── datasets/                 # CSV data files
    ├── creditcard.csv         # ~9K rows, 17 features (clustering)
    ├── londontrain.csv        # ~40K rows (regression)
    ├── londontest.csv
    ├── backpacktrain.csv      # ~24K rows (classification/regression)
    └── backpacktest.csv
```

---

## 🚀 How to Run

### Prerequisites

- **Python 3.10+** (tested with 3.12)
- **Node.js 18+** (tested with 24.x)
- **npm** (comes with Node.js)

### Step 1 — Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2 — Start the Backend Server

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be live at **http://localhost:8000**. You can verify at:
- Health check: http://localhost:8000/api/health
- Dataset list: http://localhost:8000/api/datasets/

### Step 3 — Install Frontend Dependencies

Open a **new terminal**:

```bash
cd frontend
npm install
```

### Step 4 — Start the Frontend

```bash
cd frontend
npm run dev
```

The app will be live at **http://localhost:3000**.

### ✅ That's It!

Open **http://localhost:3000** in your browser and you'll see the ML Insight Explorer. Both servers must be running simultaneously.

---

## 🔄 User Flow (4 Steps)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ 1. Choose    │ ──▶ │ 2. Analyze   │ ──▶ │ 3. Recommend &   │ ──▶ │ 4. Results   │
│    Dataset   │     │    (EDA)     │     │    Train         │     │    Dashboard │
└──────────────┘     └──────────────┘     └──────────────────┘     └──────────────┘
  Pick from 3          Auto EDA with       AI recommends task       Metrics with
  real datasets        charts, stats,      & model; user can        explanations,
                       & insights          override; train!         charts, profiles
```

---

## 📊 Datasets

| Dataset | Rows | Features | Recommended Task | Target |
|---|---|---|---|---|
| **Credit Card Customers** | ~9,000 | 17 | Clustering | — (unsupervised) |
| **London House Prices** | ~40,000 | 15+ | Regression | `price` |
| **Backpack Prices** | ~24,000 | 10+ | Regression / Classification | `price` |

---

## 🤖 Supported Models

### Classification
- Logistic Regression
- Random Forest Classifier
- Support Vector Machine (SVM)
- Gradient Boosting Classifier

### Regression
- Linear Regression
- Random Forest Regressor
- Support Vector Regressor (SVR)
- Gradient Boosting Regressor

### Clustering
- KMeans (with elbow method auto-k)
- Agglomerative Clustering
- DBSCAN

---

## 📈 Metrics Explained

Every metric is displayed with:
- 📊 **Value** — the computed score
- 📖 **Plain-English explanation** — what it means in simple terms
- ✅ **Good range** — what values to aim for
- ❓ **Why it matters** — practical significance

| Task | Metrics |
|---|---|
| Classification | Accuracy, Precision, Recall, F1 Score, ROC AUC |
| Regression | MSE, RMSE, MAE, R² |
| Clustering | Silhouette Score, Davies-Bouldin Index, Inertia |

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/datasets/` | List all datasets |
| `GET` | `/api/datasets/{slug}/info` | Dataset metadata, columns, preview |
| `GET` | `/api/datasets/{slug}/recommend` | Task recommendation with reasoning |
| `GET` | `/api/eda/{slug}` | Full EDA (stats, histograms, correlation, insights) |
| `GET` | `/api/training/models` | Available models by task |
| `POST` | `/api/training/train` | Train a model and get explained results |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python, FastAPI, Uvicorn |
| **ML** | scikit-learn, NumPy, Pandas, SciPy |
| **Frontend** | Next.js 16, TypeScript, React 19 |
| **Styling** | Tailwind CSS v4, Custom design system |
| **Data Fetching** | TanStack React Query |
| **Charts** | Recharts |
| **Icons** | Lucide React |

---

## 📸 UI Highlights

- **Dark theme** with gradient glass cards and glow effects
- **Animated stepper** showing progress across all 4 steps
- **Expandable metric cards** — click to reveal the explanation
- **Correlation heatmap** with color-coded positive/negative values
- **Cluster scatter plot** with PCA 2D projection
- **Elbow & Silhouette charts** for optimal cluster selection
- **Actual vs Predicted scatter** for regression tasks
- **Cluster profile tables** showing average feature values per group
- **Animated progress bar** during model training
- **Preprocessing pipeline** — numbered steps showing exactly what was done

---

*Built as an educational ML platform — designed to make machine learning transparent, visual, and understandable.*

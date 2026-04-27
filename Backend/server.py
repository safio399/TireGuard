from __future__ import annotations

import sys
import types
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "Model" / "model.pkl"


class PredictionRequest(BaseModel):
    air_temperature: float = Field(..., alias="air_temperature")
    process_temperature: float = Field(..., alias="process_temperature")
    rotational_speed: int = Field(..., alias="rotational_speed")
    torque: float
    tool_wear: int = Field(..., alias="tool_wear")
    type: str


class PredictionResponse(BaseModel):
    failure_probability: float
    prediction: int
    status: str


def _install_pickle_compatibility_shim() -> None:
    """
    The saved model contains one malformed reference to a module named
    "RandomForestClassifier" with a "dtype" attribute. We provide that module
    dynamically so joblib can deserialize the artifact successfully.
    """
    if "RandomForestClassifier" in sys.modules:
      return

    shim = types.ModuleType("RandomForestClassifier")
    shim.dtype = np.dtype
    sys.modules["RandomForestClassifier"] = shim


def _load_model_bundle() -> dict:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

    _install_pickle_compatibility_shim()
    bundle = joblib.load(MODEL_PATH)
    if not isinstance(bundle, dict) or "model" not in bundle or "columns" not in bundle:
        raise ValueError("Unexpected model bundle format.")
    return bundle


MODEL_BUNDLE = _load_model_bundle()
MODEL = MODEL_BUNDLE["model"]
MODEL_COLUMNS = list(MODEL_BUNDLE["columns"])
THRESHOLD = float(MODEL_BUNDLE.get("threshold", 0.5))

app = FastAPI(title="TireGuard Prediction API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:4173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_feature_frame(payload: PredictionRequest) -> pd.DataFrame:
    product_type = payload.type.strip().upper()
    if product_type not in {"L", "M", "H"}:
        raise HTTPException(status_code=422, detail="type must be one of: L, M, H")

    row = {
        "Air temperature [K]": payload.air_temperature,
        "Process temperature [K]": payload.process_temperature,
        "Rotational speed [rpm]": payload.rotational_speed,
        "Torque [Nm]": payload.torque,
        "Tool wear [min]": payload.tool_wear,
        "Type_L": 1 if product_type == "L" else 0,
        "Type_M": 1 if product_type == "M" else 0,
    }

    frame = pd.DataFrame([row])
    return frame.reindex(columns=MODEL_COLUMNS, fill_value=0)


@app.get("/")
def root() -> dict:
    return {
        "service": "TireGuard Prediction API",
        "status": "online",
        "predict_endpoint": "/predict",
        "docs": "/docs",
    }


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "model_loaded": True,
        "threshold": THRESHOLD,
        "model_path": str(MODEL_PATH),
    }


@app.get("/predict")
def predict_info() -> dict:
    return {
        "message": "Use POST /predict with machine readings to receive a prediction.",
        "expected_payload": {
            "air_temperature": 300.5,
            "process_temperature": 310.2,
            "rotational_speed": 1500,
            "torque": 42.8,
            "tool_wear": 12,
            "type": "L",
        },
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    features = _build_feature_frame(payload)

    try:
        probability = float(MODEL.predict_proba(features)[0][1])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    prediction = int(probability >= THRESHOLD)
    status = "Failure Risk" if prediction == 1 else "Healthy"

    return PredictionResponse(
        failure_probability=round(probability, 4),
        prediction=prediction,
        status=status,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)

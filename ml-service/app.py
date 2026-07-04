"""
FastAPI service that serves placement predictions from the trained model.
Run locally with:
    uvicorn app:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os

app = FastAPI(title="CareerForge AI — Placement Prediction Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Node backend calls this server-to-server, not from the browser
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

model = None
scaler = None


@app.on_event("startup")
def load_model():
    global model, scaler
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            "model.pkl not found. Run `python train_model.py` first to train and save the model."
        )
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)


class PredictionInput(BaseModel):
    cgpa: float = Field(..., ge=0, le=10)
    communication: float = Field(6.0, ge=0, le=10)
    projects: int = Field(0, ge=0)
    internships: int = Field(0, ge=0)
    certifications: int = Field(0, ge=0)
    skills_count: int = Field(0, ge=0)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Placement prediction service is running"}


@app.post("/predict")
def predict(data: PredictionInput):
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    features = pd.DataFrame(
        [[
            data.cgpa,
            data.communication,
            data.projects,
            data.internships,
            data.certifications,
            data.skills_count,
        ]],
        columns=["cgpa", "communication", "projects", "internships", "certifications", "skills_count"],
    )
    features_scaled = scaler.transform(features)

    probability = model.predict_proba(features_scaled)[0][1] * 100
    # Confidence: how far the model's probability is from the 50/50 uncertainty line
    confidence = abs(probability - 50) * 2

    return {
        "placementProbability": round(float(probability), 1),
        "confidence": round(float(min(confidence, 99)), 1),
    }

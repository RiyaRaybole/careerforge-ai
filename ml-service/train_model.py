"""
Generates a synthetic-but-realistic student placement dataset and trains a
Logistic Regression model to predict placement probability.

Why synthetic data? A real placement dataset with labeled outcomes is hard to
get for a portfolio project. This script builds one with realistic
correlations (higher CGPA/projects/internships -> higher placement chance)
so the model behaves sensibly. Swap this out for a real dataset later if
you find one (e.g. on Kaggle) — the rest of the pipeline doesn't change.

Run this once to produce model.pkl:
    python train_model.py
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import joblib

np.random.seed(42)
N = 2000

cgpa = np.clip(np.random.normal(7.2, 1.1, N), 4, 10)
communication = np.clip(np.random.normal(6.5, 1.5, N), 1, 10)
projects = np.clip(np.random.poisson(3, N), 0, 10)
internships = np.clip(np.random.poisson(1.2, N), 0, 5)
certifications = np.clip(np.random.poisson(2, N), 0, 8)
skills_count = np.clip(np.random.poisson(6, N), 0, 20)

# Placement probability driven by a weighted combination of features + noise.
# Weights are hand-tuned to produce believable, non-trivial predictions.
score = (
    (cgpa / 10) * 0.30
    + (communication / 10) * 0.15
    + (np.minimum(projects, 6) / 6) * 0.20
    + (np.minimum(internships, 3) / 3) * 0.15
    + (np.minimum(certifications, 5) / 5) * 0.10
    + (np.minimum(skills_count, 10) / 10) * 0.10
)
noise = np.random.normal(0, 0.08, N)
probability = np.clip(score + noise, 0, 1)
placed = (probability > 0.55).astype(int)

df = pd.DataFrame(
    {
        "cgpa": cgpa,
        "communication": communication,
        "projects": projects,
        "internships": internships,
        "certifications": certifications,
        "skills_count": skills_count,
        "placed": placed,
    }
)

X = df[["cgpa", "communication", "projects", "internships", "certifications", "skills_count"]]
y = df["placed"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = LogisticRegression(max_iter=1000)
model.fit(X_train_scaled, y_train)

accuracy = accuracy_score(y_test, model.predict(X_test_scaled))
print(f"Model trained. Test accuracy: {accuracy:.3f}")

joblib.dump(model, "model.pkl")
joblib.dump(scaler, "scaler.pkl")
print("Saved model.pkl and scaler.pkl")

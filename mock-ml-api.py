#!/usr/bin/env python3
"""
Mock ML API for AI4Lassa testing
This simulates the ML API that your ML guy will provide
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import random
import uvicorn
from datetime import datetime

app = FastAPI(title="AI4Lassa Mock ML API", version="1.0.0")

# Mock data models
class LocationData(BaseModel):
    lga_id: str
    coordinates: List[float]
    state: str
    population_density: float = 1000.0

class PredictionRequest(BaseModel):
    prediction_type: str
    location_data: LocationData
    case_data: Dict[str, Any] = {}

class PredictionResponse(BaseModel):
    prediction_id: str
    prediction_type: str
    confidence: float
    risk_level: str
    recommendations: List[str]
    timestamp: str
    location: str

class ModelInfo(BaseModel):
    name: str
    version: str
    accuracy: float
    last_trained: str
    status: str

# Mock health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "service": "AI4Lassa Mock ML API"
    }

# Mock models endpoint
@app.get("/models")
async def get_models():
    return {
        "models": [
            {
                "name": "outbreak_detection",
                "version": "v2.1.0",
                "accuracy": 0.89,
                "last_trained": "2025-01-10T10:30:00Z",
                "status": "active"
            },
            {
                "name": "case_classification",
                "version": "v1.8.0",
                "accuracy": 0.92,
                "last_trained": "2025-01-08T14:20:00Z",
                "status": "active"
            },
            {
                "name": "risk_assessment",
                "version": "v3.0.0",
                "accuracy": 0.85,
                "last_trained": "2025-01-12T09:15:00Z",
                "status": "active"
            }
        ]
    }

# Mock outbreak prediction
@app.post("/predict/outbreak")
async def predict_outbreak(request: PredictionRequest):
    # Mock prediction logic
    risk_factors = [
        "High population density detected",
        "Recent case clusters in neighboring areas",
        "Environmental conditions favorable for rodent activity",
        "Limited healthcare infrastructure"
    ]
    
    confidence = random.uniform(0.7, 0.95)
    risk_level = "High" if confidence > 0.8 else "Moderate" if confidence > 0.6 else "Low"
    
    recommendations = [
        "Increase surveillance in the area",
        "Distribute educational materials about Lassa fever prevention",
        "Prepare isolation facilities",
        "Alert nearby health facilities"
    ]
    
    return PredictionResponse(
        prediction_id=f"outbreak_{random.randint(1000, 9999)}",
        prediction_type="outbreak_detection",
        confidence=round(confidence, 3),
        risk_level=risk_level,
        recommendations=recommendations,
        timestamp=datetime.now().isoformat(),
        location=f"{request.location_data.state}, {request.location_data.lga_id}"
    )

# Mock case classification
@app.post("/predict/case-classification")
async def classify_case(request: PredictionRequest):
    classifications = ["Confirmed", "Probable", "Suspected", "Negative"]
    classification = random.choice(classifications)
    
    confidence = random.uniform(0.75, 0.98)
    
    recommendations = [
        "Isolate patient immediately",
        "Collect samples for laboratory testing",
        "Initiate contact tracing",
        "Provide supportive care"
    ]
    
    return PredictionResponse(
        prediction_id=f"case_{random.randint(1000, 9999)}",
        prediction_type="case_classification",
        confidence=round(confidence, 3),
        risk_level=classification,
        recommendations=recommendations,
        timestamp=datetime.now().isoformat(),
        location=f"{request.location_data.state}, {request.location_data.lga_id}"
    )

# Mock risk assessment
@app.post("/predict/risk-assessment")
async def assess_risk(request: PredictionRequest):
    risk_levels = ["Very High", "High", "Moderate", "Low", "Very Low"]
    risk_level = random.choice(risk_levels)
    
    confidence = random.uniform(0.8, 0.95)
    
    recommendations = [
        "Monitor environmental conditions",
        "Assess healthcare capacity",
        "Review emergency response plans",
        "Coordinate with local health authorities"
    ]
    
    return PredictionResponse(
        prediction_id=f"risk_{random.randint(1000, 9999)}",
        prediction_type="risk_assessment",
        confidence=round(confidence, 3),
        risk_level=risk_level,
        recommendations=recommendations,
        timestamp=datetime.now().isoformat(),
        location=f"{request.location_data.state}, {request.location_data.lga_id}"
    )

# Mock batch predictions
@app.post("/predict/batch")
async def batch_predict(request: List[PredictionRequest]):
    results = []
    for req in request:
        # Randomly choose prediction type
        pred_type = random.choice(["outbreak_detection", "case_classification", "risk_assessment"])
        
        if pred_type == "outbreak_detection":
            result = await predict_outbreak(req)
        elif pred_type == "case_classification":
            result = await classify_case(req)
        else:
            result = await assess_risk(req)
        
        results.append(result)
    
    return {"predictions": results}

# Mock model metrics
@app.get("/models/{model_name}/metrics")
async def get_model_metrics(model_name: str):
    return {
        "model_name": model_name,
        "accuracy": round(random.uniform(0.8, 0.95), 3),
        "precision": round(random.uniform(0.75, 0.92), 3),
        "recall": round(random.uniform(0.78, 0.90), 3),
        "f1_score": round(random.uniform(0.80, 0.91), 3),
        "last_updated": datetime.now().isoformat()
    }

# Mock prediction history
@app.get("/predictions/history")
async def get_prediction_history():
    return {
        "predictions": [
            {
                "id": "pred_001",
                "type": "outbreak_detection",
                "location": "Bida, Niger State",
                "risk_level": "High",
                "confidence": 0.89,
                "timestamp": "2025-01-14T10:30:00Z"
            },
            {
                "id": "pred_002",
                "type": "case_classification",
                "location": "Ile-Ife, Osun State",
                "risk_level": "Confirmed",
                "confidence": 0.94,
                "timestamp": "2025-01-14T09:15:00Z"
            }
        ]
    }

if __name__ == "__main__":
    print("🚀 Starting AI4Lassa Mock ML API...")
    print("📊 Available endpoints:")
    print("   GET  /health")
    print("   GET  /models")
    print("   POST /predict/outbreak")
    print("   POST /predict/case-classification")
    print("   POST /predict/risk-assessment")
    print("   POST /predict/batch")
    print("   GET  /models/{name}/metrics")
    print("   GET  /predictions/history")
    print("\n🌐 API will be available at: http://localhost:8000")
    print("📖 API docs at: http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

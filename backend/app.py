from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

# Load once
model = load_model("model.h5")
scaler = joblib.load("scaler.pkl")

@app.route("/")
def home():
    return "API Running"

@app.route("/predict", methods=["POST"])
def predict_api():
    data = request.json["features"]

    data = np.array(data).reshape(1, -1)
    data = scaler.transform(data)

    prob = model.predict(data)[0][0]

    # Better threshold
    result = 1 if prob > 0.7 else 0

    return jsonify({
        "result": result,
        "probability": round(float(prob) * 100, 2),
        "message": "No Disease Detected" if result == 1 else "Heart Disease Detected"
    })

if __name__ == "__main__":
    app.run(debug=True)
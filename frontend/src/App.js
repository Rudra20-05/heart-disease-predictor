import React, { useState } from "react";
import "./App.css";

const FIELD_CONFIG = [
  {
    label: "Age",
    tooltip: "Patient's age in years (typically 29–77)",
    type: "number",
    placeholder: "e.g. 52"
  },
  {
    label: "Gender",
    tooltip: "Biological sex: Male or Female",
    type: "select",
    options: [
      { value: "1", label: "Male" },
      { value: "0", label: "Female" }
    ]
  },
  {
    label: "Chest Pain Type",
    tooltip: "Type of chest pain experienced (0–3 scale from none to severe)",
    type: "select",
    options: [
      { value: "0", label: "No Pain" },
      { value: "1", label: "Mild" },
      { value: "2", label: "Moderate" },
      { value: "3", label: "Severe" }
    ]
  },
  {
    label: "Blood Pressure",
    tooltip: "Resting blood pressure in mmHg (normal: 90–120)",
    type: "number",
    placeholder: "e.g. 130"
  },
  {
    label: "Cholesterol",
    tooltip: "Serum cholesterol in mg/dL (normal: 150–200)",
    type: "number",
    placeholder: "e.g. 240"
  },
  {
    label: "High Blood Sugar",
    tooltip: "Fasting blood sugar > 120 mg/dL? (Yes/No)",
    type: "select",
    options: [
      { value: "1", label: "Yes (>120 mg/dL)" },
      { value: "0", label: "No (Normal)" }
    ]
  },
  {
    label: "ECG Result",
    tooltip: "Resting electrocardiographic results (0=Normal, 1=Minor, 2=Abnormal)",
    type: "select",
    options: [
      { value: "0", label: "Normal" },
      { value: "1", label: "Minor Issue" },
      { value: "2", label: "Abnormal" }
    ]
  },
  {
    label: "Max Heart Rate",
    tooltip: "Maximum heart rate achieved during exercise (typical: 120–200 bpm)",
    type: "number",
    placeholder: "e.g. 150"
  },
  {
    label: "Exercise Angina",
    tooltip: "Chest pain induced by exercise? (Yes/No)",
    type: "select",
    options: [
      { value: "1", label: "Yes" },
      { value: "0", label: "No" }
    ]
  },
  {
    label: "Heart Stress Level",
    tooltip: "ST depression induced by exercise relative to rest (0.0–6.2)",
    type: "number",
    placeholder: "e.g. 1.5"
  },
  {
    label: "Slope",
    tooltip: "Slope of peak exercise ST segment (0=Down, 1=Flat, 2=Up)",
    type: "select",
    options: [
      { value: "0", label: "Downsloping" },
      { value: "1", label: "Flat" },
      { value: "2", label: "Upsloping" }
    ]
  },
  {
    label: "Blocked Vessels",
    tooltip: "Number of major vessels colored by fluoroscopy (0–3)",
    type: "select",
    options: [
      { value: "0", label: "0 — None" },
      { value: "1", label: "1 Vessel" },
      { value: "2", label: "2 Vessels" },
      { value: "3", label: "3 Vessels" }
    ]
  },
  {
    label: "Thal Test",
    tooltip: "Thallium stress test result (1=Normal, 2=Fixed Defect, 3=Reversible Defect)",
    type: "select",
    options: [
      { value: "1", label: "Normal" },
      { value: "2", label: "Fixed Defect" },
      { value: "3", label: "Reversible Defect" }
    ]
  }
];

function Tooltip({ text }) {
  return (
    <span className="tooltip-wrapper">
      <span className="tooltip-icon">i</span>
      <span className="tooltip-text">{text}</span>
    </span>
  );
}

function App() {
  const [form, setForm] = useState(Array(13).fill(""));
  const [invalidFields, setInvalidFields] = useState(new Set());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModelInfo, setShowModelInfo] = useState(false);

  const handleChange = (i, value) => {
    const newForm = [...form];
    newForm[i] = value;
    setForm(newForm);
    // Clear invalid state when user types
    if (invalidFields.has(i)) {
      const newInvalid = new Set(invalidFields);
      newInvalid.delete(i);
      setInvalidFields(newInvalid);
    }
  };

  const validate = () => {
    const invalid = new Set();
    for (let i = 0; i < form.length; i++) {
      if (form[i] === "") { invalid.add(i); continue; }
      if (i === 2 && (form[i] < 0 || form[i] > 3)) invalid.add(i);
      if (i === 6 && (form[i] < 0 || form[i] > 2)) invalid.add(i);
      if (i === 10 && (form[i] < 0 || form[i] > 2)) invalid.add(i);
      if (i === 11 && (form[i] < 0 || form[i] > 3)) invalid.add(i);
      if (i === 12 && (form[i] < 1 || form[i] > 3)) invalid.add(i);
    }
    setInvalidFields(invalid);
    return invalid.size === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: form.map(Number) })
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: true, message: "Server Error — make sure Flask backend is running" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(Array(13).fill(""));
    setResult(null);
    setInvalidFields(new Set());
  };

  const getRiskClass = (risk) => {
    if (!risk) return "";
    const r = risk.toLowerCase();
    if (r === "low") return "risk-low";
    if (r === "medium") return "risk-medium";
    return "risk-high";
  };

  const getGaugeClass = (prob) => {
    if (prob < 35) return "low";
    if (prob < 65) return "medium";
    return "high";
  };

  return (
    <>
      <div className="bg-particles" />
      <div className="app-container">

        {/* HEADER */}
        <header className="header">
          <div className="header-icon">❤️</div>
          <h1>Heart Disease Predictor</h1>
          <p className="subtitle">
            Powered by <span>Artificial Neural Network (ANN)</span> — Soft Computing Project
          </p>
        </header>

        {/* MAIN FORM CARD */}
        <div className="glass-card">
          <div className="section-title">Patient Health Parameters</div>

          <div className="form-grid">
            {FIELD_CONFIG.map((field, i) => (
              <div key={i} className="field-group">
                <label className="field-label">
                  {field.label}
                  <Tooltip text={field.tooltip} />
                </label>

                {field.type === "select" ? (
                  <select
                    value={form[i]}
                    onChange={(e) => handleChange(i, e.target.value)}
                    className={invalidFields.has(i) ? "invalid" : ""}
                  >
                    <option value="">Select</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    step="any"
                    placeholder={field.placeholder}
                    value={form[i]}
                    onChange={(e) => handleChange(i, e.target.value)}
                    className={invalidFields.has(i) ? "invalid" : ""}
                  />
                )}
              </div>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="buttons-row">
            <button
              className="predict-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "🔬 Predict"}
            </button>
            <button className="reset-btn" onClick={handleReset}>
              ↺ Reset
            </button>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="loading-container">
              <div className="loading-heart">❤️</div>
              <p className="loading-text">
                Analyzing health parameters<span className="loading-dots"></span>
              </p>
            </div>
          )}

          {/* RESULT */}
          {result && !result.error && (
            <div className={`result-card ${result.result === 1 ? "healthy" : "disease"}`}>
              <div className="result-icon">
                {result.result === 1 ? "💚" : "🫀"}
              </div>
              <div className="result-message">{result.message}</div>
              <div className={`risk-level ${getRiskClass(result.risk_level)}`}>
                {result.risk_level} Risk
              </div>

              {/* GAUGE BAR */}
              <div className="gauge-section">
                <div className="gauge-header">
                  <span className="gauge-label">Confidence Score</span>
                  <span className="gauge-value">{result.probability}%</span>
                </div>
                <div className="gauge-bar">
                  <div
                    className={`gauge-fill ${getGaugeClass(result.probability)}`}
                    style={{ width: `${result.probability}%` }}
                  />
                </div>
              </div>

              {/* HEALTH TIPS */}
              {result.tips && result.tips.length > 0 && (
                <div className="health-tips">
                  <div className="health-tips-title">💡 Health Recommendations</div>
                  <ul>
                    {result.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ERROR */}
          {result && result.error && (
            <div className="result-card disease">
              <div className="result-icon">⚠️</div>
              <div className="result-message" style={{ color: "#eab308" }}>
                {result.message}
              </div>
            </div>
          )}
        </div>

        {/* MODEL INFO */}
        <div className="model-info-section">
          <div className="model-info-card">
            <div
              className="model-info-header"
              onClick={() => setShowModelInfo(!showModelInfo)}
            >
              <h3>🧠 ANN Model Architecture</h3>
              <span className={`model-info-toggle ${showModelInfo ? "open" : ""}`}>
                ▼
              </span>
            </div>
            {showModelInfo && (
              <div className="model-info-content">
                <div className="info-chip">
                  <div className="info-chip-label">Type</div>
                  <div className="info-chip-value">Sequential ANN</div>
                </div>
                <div className="info-chip">
                  <div className="info-chip-label">Input Features</div>
                  <div className="info-chip-value">13</div>
                </div>
                <div className="info-chip">
                  <div className="info-chip-label">Hidden Layers</div>
                  <div className="info-chip-value">2 (32 → 16)</div>
                </div>
                <div className="info-chip">
                  <div className="info-chip-label">Activation</div>
                  <div className="info-chip-value">ReLU + Sigmoid</div>
                </div>
                <div className="info-chip">
                  <div className="info-chip-label">Regularization</div>
                  <div className="info-chip-value">L2 + Dropout</div>
                </div>
                <div className="info-chip">
                  <div className="info-chip-label">Optimizer</div>
                  <div className="info-chip-value">Adam</div>
                </div>
                <div className="info-chip">
                  <div className="info-chip-label">Loss Function</div>
                  <div className="info-chip-value">Binary Crossentropy</div>
                </div>
                <div className="info-chip">
                  <div className="info-chip-label">Early Stopping</div>
                  <div className="info-chip-value">Patience: 10</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <p>
            Built with <span>TensorFlow/Keras</span> &amp; <span>React</span> — Soft Computing Mini Project
          </p>
        </footer>
      </div>
    </>
  );
}

export default App;
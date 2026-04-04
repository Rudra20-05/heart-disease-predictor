import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.regularizers import l2

# =========================
# 1. LOAD DATA
# =========================
data = pd.read_csv("heart.csv")

# Shuffle dataset (important)
data = data.sample(frac=1, random_state=42).reset_index(drop=True)

# Check balance (for debugging)
print("Class Distribution:\n", data["target"].value_counts())

# =========================
# 2. FEATURES & TARGET
# =========================
X = data.drop("target", axis=1)
y = data["target"]

# =========================
# 3. TRAIN TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# =========================
# 4. SCALING
# =========================
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Save scaler
joblib.dump(scaler, "scaler.pkl")

# =========================
# 5. BUILD MODEL (TUNED)
# =========================
model = Sequential([
    Dense(32, activation='relu', input_dim=13, kernel_regularizer=l2(0.01)),
    Dropout(0.3),

    Dense(16, activation='relu', kernel_regularizer=l2(0.01)),
    Dropout(0.2),

    Dense(1, activation='sigmoid')
])

model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)

# =========================
# 6. EARLY STOPPING
# =========================
early_stop = EarlyStopping(
    monitor='val_loss',
    patience=10,
    restore_best_weights=True
)

# =========================
# 7. TRAIN MODEL
# =========================
history = model.fit(
    X_train, y_train,
    epochs=100,
    batch_size=16,
    validation_split=0.2,
    callbacks=[early_stop],
    verbose=1
)

# =========================
# 8. EVALUATE
# =========================
loss, accuracy = model.evaluate(X_test, y_test)
print("Final Accuracy:", accuracy)

# =========================
# 9. SAVE MODEL
# =========================
model.save("model.h5")

print("Model & Scaler saved successfully ✅")
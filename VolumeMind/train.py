import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("=== VolumeMind: Menjalankan Pelatihan Model AI (Anti-Overfitting) ===")

# 1. Memuat dataset
print(" Membaca dataset 'volumemate_dataset_final.csv'...")
df = pd.read_csv('volumemate_dataset_final.csv')

# Ekstraksi tahun dan bulan dari tanggal untuk pelatihan
df['tanggal'] = pd.to_datetime(df['tanggal'])
df['tahun'] = df['tanggal'].dt.year
df['bulan'] = df['tanggal'].dt.month

# 2. Pembersihan data curah hujan (-1 values)
print(" Membersihkan data curah hujan...")
monthly_rain = df[df['curah_hujan_mm'] != -1].groupby('bulan')['curah_hujan_mm'].mean()
df['curah_hujan_mm'] = df.apply(
    lambda row: round(monthly_rain[row['bulan']], 1) if row['curah_hujan_mm'] == -1 else row['curah_hujan_mm'],
    axis=1
)

# 3. Menentukan fitur (X) dan target (y)
X = df[['tahun', 'bulan', 'id_koperasi', 'jenis_pupuk', 'curah_hujan_mm', 'musim_tanam', 'luas_lahan_hektar']]
y = df['volume_kebutuhan_kg']

# 4. Pemisahan data kronologis (Time-Based Split)
print(" Membagi data menjadi Train (2021-2024) dan Test (2025)...")
X_train = X[X['tahun'] < 2025]
y_train = y[X['tahun'] < 2025]
X_test = X[X['tahun'] == 2025]
y_test = y[X['tahun'] == 2025]

# 5. Pipeline Preprocessing
categorical_features = ['id_koperasi', 'jenis_pupuk', 'musim_tanam']
categorical_transformer = OneHotEncoder(handle_unknown='ignore', sparse_output=False)

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', categorical_transformer, categorical_features)
    ],
    remainder='passthrough'
)

# 6. Pipeline Model dengan regulasi hiperparameter
print(" Melatih model RandomForestRegressor ter-regulasi...")
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(
        n_estimators=100,
        max_depth=8,
        min_samples_leaf=4,
        min_samples_split=10,
        random_state=42
    ))
])

model.fit(X_train, y_train)

# 7. Evaluasi performa model
print(" Mengevaluasi performa dan stabilitas model...")
y_train_pred = model.predict(X_train)
y_test_pred = model.predict(X_test)

r2_train = r2_score(y_train, y_train_pred)
r2_test = r2_score(y_test, y_test_pred)
mae_test = mean_absolute_error(y_test, y_test_pred)
mape_test = np.mean(np.abs((y_test - y_test_pred) / y_test)) * 100
accuracy_test = 100 - mape_test

print("\n--- Hasil Evaluasi Generalisasi Model ---")
print(f"R2 Score (Data Train Latih) : {r2_train:.4f}")
print(f"R2 Score (Data Test Uji)   : {r2_test:.4f}")
print(f"Mean Absolute Error (Test)  : {mae_test:.2f} kg")
print(f"Akurasi Model pada Test     : {accuracy_test:.2f}%")
print("-----------------------------------------")

if (r2_train - r2_test) > 0.05:
    print("PERINGATAN: Selisih skor > 5%. Model mungkin mengalami overfitting ringan.")
else:
    print("AMAN: Selisih skor < 5%. Model terbukti tidak mengalami overfitting.")

# 8. Validasi Silang Kronologis (Cross Validation)
print("\n Menjalankan Time-Series Cross-Validation...")
tscv = TimeSeriesSplit(n_splits=5)
cv_scores = cross_val_score(model, X_train, y_train, cv=tscv, scoring='r2')
print(f"R2 Scores per Fold : {[round(s, 4) for s in cv_scores]}")
print(f"Rata-rata R2 Score : {cv_scores.mean():.4f}")

# 9. Penyimpanan model
model_filename = 'demand_forecasting_model.joblib'
joblib.dump(model, model_filename)
print(f"\n Model berhasil disimpan ke '{model_filename}'")
print("Pelatihan selesai!\n")

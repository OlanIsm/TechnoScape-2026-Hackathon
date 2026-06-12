from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import joblib
import os

app = FastAPI(
    title="🌿 VolumeMind AI Engine API",
    description="Microservice untuk demand forecasting & optimasi pembelian pupuk berdasarkan volume tiers.",
    version="1.0.0"
)

# Tentukan path model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'demand_forecasting_model.joblib')
model = None

# Pemuatan Model saat startup
@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print("=== Model demand_forecasting_model.joblib berhasil dimuat! ===")
        except Exception as e:
            print(f"Error memuat model: {e}")
    else:
        print(f"Peringatan: Berkas model tidak ditemukan di {MODEL_PATH}. Endpoint /predict akan error sebelum model dilatih & disimpan.")

# Schema Input untuk Prediksi Kebutuhan
class PredictRequest(BaseModel):
    tahun: int
    bulan: int
    id_koperasi: str
    jenis_pupuk: str
    curah_hujan_mm: float
    musim_tanam: str
    luas_lahan_hektar: float

# Schema Output Prediksi
class PredictResponse(BaseModel):
    predicted_demand_kg: float
    message: str

# Schema untuk Tier Harga Supplier
class PriceTier(BaseModel):
    min_volume: float
    max_volume: Optional[float] = None
    price_per_kg: float

class Supplier(BaseModel):
    name: str
    tiers: List[PriceTier]

# Schema Input Rekomendasi
class RecommendRequest(BaseModel):
    predicted_demand_kg: float
    suppliers: List[Supplier]

# Schema Output Rekomendasi
class RecommendResponse(BaseModel):
    recommended_supplier: str
    recommended_volume_kg: float
    unit_price_per_kg: float
    total_cost: float
    is_volume_hack: bool
    extra_volume_gained_kg: float
    savings_rp: float
    explanation: str

@app.get("/")
def home():
    return {"status": "running", "service": "VolumeMind AI Engine"}

# 1. Endpoint /predict (Demand Forecasting)
@app.post("/predict", response_model=PredictResponse)
def predict_demand(request: PredictRequest):
    global model
    if model is None:
        raise HTTPException(status_code=503, detail="Model belum siap atau tidak ditemukan di server.")
    
    try:
        # Buat dataframe dari request input
        input_data = pd.DataFrame([{
            'tahun': request.tahun,
            'bulan': request.bulan,
            'id_koperasi': request.id_koperasi,
            'jenis_pupuk': request.jenis_pupuk,
            'curah_hujan_mm': request.curah_hujan_mm,
            'musim_tanam': request.musim_tanam,
            'luas_lahan_hektar': request.luas_lahan_hektar
        }])
        
        # Prediksi kebutuhan
        prediction = model.predict(input_data)[0]
        predicted_kg = round(max(0.0, float(prediction)), 1)
        
        return PredictResponse(
            predicted_demand_kg=predicted_kg,
            message="Prediksi berhasil dihitung."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat memprediksi: {str(e)}")

# 2. Endpoint /recommend (Optimal Buy Algorithm & Volume Hack)
@app.post("/recommend", response_model=RecommendResponse)
def recommend_buy(request: RecommendRequest):
    demand = request.predicted_demand_kg
    if demand <= 0:
        raise HTTPException(status_code=400, detail="Volume kebutuhan harus lebih besar dari 0.")
    
    best_option = None
    
    for supplier in request.suppliers:
        # Cari harga jika membeli tepat sesuai kebutuhan (exact demand)
        exact_price = None
        for tier in supplier.tiers:
            max_vol = tier.max_volume if tier.max_volume is not None else float('inf')
            if tier.min_volume <= demand <= max_vol:
                exact_price = tier.price_per_kg
                break
        
        if exact_price is None:
            continue
            
        exact_cost = demand * exact_price
        
        # Opsi Default (beli pas sesuai kebutuhan)
        supplier_options = [{
            'supplier': supplier.name,
            'volume': demand,
            'unit_price': exact_price,
            'total_cost': exact_cost,
            'is_volume_hack': False,
            'extra_volume': 0.0,
            'savings': 0.0,
            'explanation': f"Membeli pas sesuai kebutuhan ({demand:.1f} kg) dari {supplier.name} dengan harga Rp {exact_price:.2f}/kg."
        }]
        
        # Mengecek "Volume Hack" (apakah beli lebih banyak agar masuk ke tier berikutnya justru lebih murah?)
        for tier in supplier.tiers:
            # Cari tier dengan min_volume di atas demand saat ini
            if tier.min_volume > demand:
                hack_volume = tier.min_volume
                hack_price = tier.price_per_kg
                hack_cost = hack_volume * hack_price
                
                # Jika total biaya untuk membeli volume lebih banyak ternyata lebih murah!
                if hack_cost < exact_cost:
                    savings = exact_cost - hack_cost
                    extra_vol = hack_volume - demand
                    supplier_options.append({
                        'supplier': supplier.name,
                        'volume': hack_volume,
                        'unit_price': hack_price,
                        'total_cost': hack_cost,
                        'is_volume_hack': True,
                        'extra_volume': extra_vol,
                        'savings': savings,
                        'explanation': f"VOLUME HACK! Beli lebih banyak ({hack_volume:.1f} kg) dari {supplier.name} untuk menembus tier harga murah Rp {hack_price:.2f}/kg (Hemat Rp {savings:.2f} dan mendapat bonus +{extra_vol:.1f} kg pupuk)."
                    })
        
        # Cari opsi terbaik (biaya terendah) dari supplier ini
        best_supplier_option = min(supplier_options, key=lambda x: x['total_cost'])
        
        if best_option is None or best_supplier_option['total_cost'] < best_option['total_cost']:
            best_option = best_supplier_option
            
            # Khusus untuk baseline pembanding penghematan lintas supplier
            best_option['baseline_cost'] = exact_cost
            
    if best_option is None:
        raise HTTPException(status_code=400, detail="Tidak ada kecocokan tier harga dari supplier yang diberikan.")
        
    return RecommendResponse(
        recommended_supplier=best_option['supplier'],
        recommended_volume_kg=best_option['volume'],
        unit_price_per_kg=best_option['unit_price'],
        total_cost=best_option['total_cost'],
        is_volume_hack=best_option['is_volume_hack'],
        extra_volume_gained_kg=best_option['extra_volume'],
        savings_rp=best_option['savings'],
        explanation=best_option['explanation']
    )

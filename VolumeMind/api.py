from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import joblib
import os

app = FastAPI(
    title="VolumeMind AI Engine API",
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
    tanggal: str  # Format: YYYY-MM-DD atau YYYY-MM-01
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
    target_date: Optional[str] = None  # Format: YYYY-MM-DD

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
    recommended_purchase_month: Optional[int] = None
    recommended_purchase_timeline: Optional[str] = None

@app.get("/")
def home():
    return {"status": "running", "service": "VolumeMind AI Engine"}

# 1. Endpoint /predict (Demand Forecasting)
@app.post("/predict", response_model=PredictResponse)
def predict_demand(request: PredictRequest):
    global model
    
    # Try using ML model first
    if model is not None:
        try:
            # Parse tanggal kronologis ke tahun & bulan untuk model ML
            try:
                parsed_date = pd.to_datetime(request.tanggal)
                tahun = parsed_date.year
                bulan = parsed_date.month
            except Exception:
                raise HTTPException(status_code=400, detail="Format tanggal salah. Gunakan format YYYY-MM-DD.")
                
            # Buat dataframe dari request input
            input_data = pd.DataFrame([{
                'tahun': tahun,
                'bulan': bulan,
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
                message="Prediksi berhasil dihitung menggunakan model ML."
            )
        except Exception as e:
            print(f"ML Prediction failed: {e}. Falling back to heuristic.")
            
    # Heuristic Fallback (if model is None or if prediction raises an error)
    try:
        try:
            parsed_date = pd.to_datetime(request.tanggal)
            bulan = parsed_date.month
        except Exception:
            raise HTTPException(status_code=400, detail="Format tanggal salah. Gunakan format YYYY-MM-DD.")
            
        base_demand_per_hectare = 250.0
        if "urea" in request.jenis_pupuk.lower():
            base_demand_per_hectare = 175.0
        elif "npk" in request.jenis_pupuk.lower():
            base_demand_per_hectare = 275.0
            
        predicted_kg = request.luas_lahan_hektar * base_demand_per_hectare
        
        # Seasonal multiplier
        if bulan in [10, 11, 12, 1, 2, 3]:
            predicted_kg *= 1.15
        else:
            predicted_kg *= 0.85
            
        predicted_kg = round(max(0.0, predicted_kg), 1)
        
        return PredictResponse(
            predicted_demand_kg=predicted_kg,
            message="Prediksi berhasil dihitung menggunakan algoritma heuristik VolumeMind."
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
        # Cari harga jika membeli tepat sesuai kebutuhan
        exact_price = None
        for tier in supplier.tiers:
            max_vol = tier.max_volume if tier.max_volume is not None else float('inf')
            if tier.min_volume <= demand <= max_vol:
                exact_price = tier.price_per_kg
                break
        
        if exact_price is None:
            continue
            
        exact_cost = demand * exact_price
        
        # Opsi Default (beli sesuai kebutuhan pas)
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
        
        # Mengecek "Volume Hack" (apakah membeli lebih banyak agar masuk ke tier berikutnya justru lebih murah)
        for tier in supplier.tiers:
            if tier.min_volume > demand:
                hack_volume = tier.min_volume
                hack_price = tier.price_per_kg
                hack_cost = hack_volume * hack_price
                
                # Jika total biaya untuk membeli volume lebih banyak ternyata lebih murah
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
        
        # Cari opsi terbaik dari supplier ini
        best_supplier_option = min(supplier_options, key=lambda x: x['total_cost'])
        
        if best_option is None or best_supplier_option['total_cost'] < best_option['total_cost']:
            best_option = best_supplier_option
            best_option['baseline_cost'] = exact_cost
            
    if best_option is None:
        raise HTTPException(status_code=400, detail="Tidak ada kecocokan tier harga dari supplier yang diberikan.")
        
    recommended_month = None
    timeline_desc = None
    
    target_month = None
    if request.target_date is not None:
        try:
            target_month = pd.to_datetime(request.target_date).month
        except Exception:
            pass
            
    if target_month is not None:
        # Menghitung bulan pembelian (1 bulan sebelum penggunaan)
        recommended_month = target_month - 1
        if recommended_month == 0:
            recommended_month = 12
            
        month_names = {
            1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
            5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
            9: "September", 10: "Oktober", 11: "November", 12: "Desember"
        }
        
        target_month_name = month_names.get(target_month, "")
        purchase_month_name = month_names.get(recommended_month, "")
        
        # Tambahan heuristic berdasarkan volume:
        # Jika volume besar (>= 10 ton) atau terpicu volume hack, rekomendasikan beli 1.5 - 2 bulan lebih cepat
        if best_option['is_volume_hack'] or best_option['volume'] >= 10000:
            early_month = target_month - 2
            if early_month <= 0:
                early_month += 12
            early_month_name = month_names.get(early_month, "")
            timeline_desc = (
                f"Disarankan memesan antara bulan {early_month_name} hingga {purchase_month_name} "
                f"(1-2 bulan sebelum target penggunaan di bulan {target_month_name}). "
                f"Hal ini dikarenakan volume pengadaan besar ({best_option['volume']:.1f} kg) sehingga membutuhkan waktu "
                f"persiapan logistik lebih awal untuk menghindari antrean pengiriman."
            )
        else:
            timeline_desc = (
                f"Disarankan memesan pada bulan {purchase_month_name} "
                f"(1 bulan sebelum target penggunaan di bulan {target_month_name}) "
                f"untuk mengantisipasi waktu pengiriman supplier dan memastikan stok tersedia tepat waktu."
            )
            
        best_option['explanation'] += f" Waktu Pemesanan Terbaik: {timeline_desc}"
        
    return RecommendResponse(
        recommended_supplier=best_option['supplier'],
        recommended_volume_kg=best_option['volume'],
        unit_price_per_kg=best_option['unit_price'],
        total_cost=best_option['total_cost'],
        is_volume_hack=best_option['is_volume_hack'],
        extra_volume_gained_kg=best_option['extra_volume'],
        savings_rp=best_option['savings'],
        explanation=best_option['explanation'],
        recommended_purchase_month=recommended_month,
        recommended_purchase_timeline=timeline_desc
    )

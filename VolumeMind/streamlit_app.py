import streamlit as st
import pandas as pd
import joblib
import os

# 1. Konfigurasi Halaman (Biar UI-nya luas dan rapi)
st.set_page_config(page_title="VolumeMind AI", page_icon="🌿", layout="centered")

# Custom CSS for modern premium look
st.markdown("""
<style>
    .reportview-container {
        background: #f4f6f4;
    }
    .card {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 12px;
        border-left: 5px solid #2e7d32;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        margin-bottom: 20px;
    }
    .hack-card {
        background-color: #fffde7;
        padding: 20px;
        border-radius: 12px;
        border-left: 5px solid #fbc02d;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        margin-bottom: 20px;
    }
    .section-header {
        font-size: 1.3rem;
        font-weight: 700;
        color: #1b5e20;
        margin-top: 20px;
        margin-bottom: 10px;
    }
    .metric-container {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        margin-bottom: 10px;
    }
    .metric-box {
        background-color: #f1f8e9;
        padding: 15px;
        border-radius: 8px;
        width: 31%;
        text-align: center;
        border: 1px solid #dcedc8;
    }
    .metric-value {
        font-size: 1.5rem;
        font-weight: 800;
        color: #33691e;
    }
    .metric-label {
        font-size: 0.85rem;
        color: #558b2f;
    }
</style>
""", unsafe_allow_html=True)

# 2. Load Model (Pake path aman)
@st.cache_resource
def load_model():
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'demand_forecasting_model.joblib')
    return joblib.load(model_path)

model = load_model()

# Define mock suppliers catalog
MOCK_SUPPLIERS = {
    "PT Pupuk Sriwidjaja (Pusri)": [
        (0, 5000, 9500),      # min_vol, max_vol, price_per_kg
        (5000, 15000, 8800),
        (15000, None, 8000)
    ],
    "PT Petrokimia Gresik": [
        (0, 10000, 9200),
        (10000, 25000, 8500),
        (25000, None, 7800)
    ],
    "Distributor CV Tani Makmur": [
        (0, 3000, 10000),
        (3000, 8000, 9000),
        (8000, None, 8200)
    ]
}

# 3. Header UI
st.title("🌿 VolumeMind AI Engine")
st.subheader("Smart Demand Forecasting & Optimal Procurement System")
st.markdown("---")

# Collapsible Supplier Catalog
with st.expander("📊 Katalog & Tier Harga Supplier (Negosiasi Offline)"):
    for name, tiers in MOCK_SUPPLIERS.items():
        st.markdown(f"**🏢 {name}**")
        data = []
        for min_v, max_v, price in tiers:
            max_v_str = f"{max_v:,} kg" if max_v is not None else "∞"
            data.append({
                "Volume Min (kg)": f"{min_v:,}",
                "Volume Maks (kg)": max_v_str,
                "Harga per kg (Rp)": f"Rp {price:,}"
            })
        st.table(pd.DataFrame(data))

# 4. Layout Form Input
col1, col2 = st.columns(2)

with col1:
    st.markdown("**📝 Detail Koperasi & Waktu**")
    koperasi = st.selectbox("Pilih Koperasi", ["kop-sumber-makmur", "kop-tunas-tani", "kop-padiwangi", "kop-melati-jaya"])
    tahun = st.number_input("Tahun Prediksi", min_value=2025, max_value=2030, value=2026)
    bulan = st.slider("Bulan (1-12)", 1, 12, 10)

with col2:
    st.markdown("**🌱 Parameter Pertanian**")
    pupuk = st.selectbox("Jenis Pupuk", ["Urea", "NPK", "SP-36"])
    musim = st.selectbox("Musim Tanam", ["Rendengan", "Gadu", "Paceklik"])
    curah_hujan = st.number_input("Curah Hujan (mm)", min_value=0, max_value=600, value=300)
    luas_lahan = st.number_input("Luas Lahan (Hektar)", min_value=10, max_value=5000, value=500)

st.markdown("---")

# 5. Recommendation Engine Function
def recommend_buy(demand, suppliers, target_month):
    best_option = None
    for name, tiers in suppliers.items():
        # Find price for exact demand
        exact_price = None
        for min_v, max_v, price in tiers:
            max_v = max_v if max_v is not None else float('inf')
            if min_v <= demand <= max_v:
                exact_price = price
                break
        if exact_price is None:
            continue
        exact_cost = demand * exact_price
        
        supplier_options = [{
            'supplier': name,
            'volume': demand,
            'unit_price': exact_price,
            'total_cost': exact_cost,
            'is_volume_hack': False,
            'extra_volume': 0.0,
            'savings': 0.0,
            'explanation': f"Membeli pas sesuai kebutuhan ({demand:,.1f} kg) dari {name} dengan harga Rp {exact_price:,.2f}/kg."
        }]
        
        # Check volume hack
        for min_v, max_v, price in tiers:
            if min_v > demand:
                hack_volume = min_v
                hack_price = price
                hack_cost = hack_volume * hack_price
                if hack_cost < exact_cost:
                    savings = exact_cost - hack_cost
                    extra_vol = hack_volume - demand
                    supplier_options.append({
                        'supplier': name,
                        'volume': hack_volume,
                        'unit_price': hack_price,
                        'total_cost': hack_cost,
                        'is_volume_hack': True,
                        'extra_volume': extra_vol,
                        'savings': savings,
                        'explanation': f"VOLUME HACK! Beli lebih banyak ({hack_volume:,.1f} kg) dari {name} untuk menembus tier harga murah Rp {hack_price:,.2f}/kg (Hemat Rp {savings:,.2f} dan mendapat bonus +{extra_vol:,.1f} kg pupuk)."
                    })
        
        best_supplier_option = min(supplier_options, key=lambda x: x['total_cost'])
        if best_option is None or best_supplier_option['total_cost'] < best_option['total_cost']:
            best_option = best_supplier_option
            best_option['baseline_cost'] = exact_cost
            
    if best_option is not None and target_month is not None:
        recommended_month = target_month - 1
        if recommended_month == 0:
            recommended_month = 12
            
        month_names = {
            1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
            5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
            9: "September", 10: "Oktober", 11: "November", 12: "Desember"
        }
        
        target_month_name = month_names[target_month]
        purchase_month_name = month_names[recommended_month]
        
        if best_option['is_volume_hack'] or best_option['volume'] >= 10000:
            early_month = target_month - 2
            if early_month <= 0:
                early_month += 12
            early_month_name = month_names[early_month]
            timeline_desc = (
                f"Disarankan memesan antara bulan **{early_month_name}** hingga **{purchase_month_name}** "
                f"(1-2 bulan sebelum target penggunaan di bulan {target_month_name}). "
                f"Hal ini dikarenakan volume pengadaan besar ({best_option['volume']:,.1f} kg) sehingga membutuhkan waktu "
                f"persiapan logistik lebih awal untuk menghindari antrean pengiriman."
            )
        else:
            timeline_desc = (
                f"Disarankan memesan pada bulan **{purchase_month_name}** "
                f"(1 bulan sebelum target penggunaan di bulan {target_month_name}) "
                f"untuk mengantisipasi waktu pengiriman supplier dan memastikan stok tersedia tepat waktu."
            )
        best_option['recommended_purchase_month'] = recommended_month
        best_option['recommended_purchase_timeline'] = timeline_desc
        best_option['explanation'] += f" Waktu Pemesanan Terbaik: {timeline_desc}"
        
    return best_option

# 6. Tombol Eksekusi
if st.button("🔮 Analisis & Hitung Pengadaan Optimal", use_container_width=True):
    with st.spinner('VolumeMind sedang menganalisis data historis & penawaran supplier...'):
        
        # Susun dataframe input
        input_data = pd.DataFrame([{
            'tahun': tahun,
            'bulan': bulan,
            'id_koperasi': koperasi,
            'jenis_pupuk': pupuk,
            'curah_hujan_mm': curah_hujan,
            'musim_tanam': musim,
            'luas_lahan_hektar': luas_lahan
        }])
        
        # 1. Eksekusi Prediksi
        prediksi = model.predict(input_data)[0]
        predicted_demand_kg = round(max(0.0, float(prediksi)), 1)
        
        st.success("Analisis Selesai!")
        
        # Tampilkan Prediksi Demand
        st.markdown('<div class="section-header">🧠 Hasil Prediksi Kebutuhan (Demand Forecasting)</div>', unsafe_allow_html=True)
        st.metric(label=f"Prediksi Kebutuhan {pupuk} ({koperasi}) - Target Penggunaan Bulan {bulan}", value=f"{predicted_demand_kg:,.1f} kg")
        
        # 2. Eksekusi Rekomendasi
        recommendation = recommend_buy(predicted_demand_kg, MOCK_SUPPLIERS, bulan)
        
        if recommendation:
            st.markdown('<div class="section-header">🤝 Rekomendasi Pembelian Optimal (Optimal Buy Engine)</div>', unsafe_allow_html=True)
            
            # Tentukan tipe card berdasarkan is_volume_hack
            card_class = "hack-card" if recommendation['is_volume_hack'] else "card"
            
            if recommendation['is_volume_hack']:
                st.warning(f"⚠️ **VOLUME HACK TERDETEKSI!** Membeli lebih banyak dari kebutuhan riil ternyata lebih murah karena menembus tier diskon harga supplier!")
            
            # HTML Card View
            html_content = f"""
            <div class="{card_class}">
                <h4><b>🏢 Supplier Terpilih: {recommendation['supplier']}</b></h4>
                <div class="metric-container">
                    <div class="metric-box">
                        <div class="metric-value">{recommendation['volume']:,.1f} kg</div>
                        <div class="metric-label">Volume Dibeli</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value">Rp {recommendation['unit_price']:,.0f}/kg</div>
                        <div class="metric-label">Harga Satuan</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value">Rp {recommendation['total_cost']:,.0f}</div>
                        <div class="metric-label">Estimasi Total Biaya</div>
                    </div>
                </div>
                <p style="margin-top:15px; color:#333; line-height: 1.6;">
                    💡 <b>Analisis Keputusan:</b> {recommendation['explanation']}
                </p>
            </div>
            """
            st.markdown(html_content, unsafe_allow_html=True)
            
            # Detail Penghematan
            col_save1, col_save2 = st.columns(2)
            with col_save1:
                st.metric("Total Hemat (Savings)", f"Rp {recommendation['savings']:,.0f}")
            with col_save2:
                bonus_vol = recommendation['extra_volume']
                st.metric("Volume Bonus / Lebih", f"+{bonus_vol:,.1f} kg" if bonus_vol > 0 else "0 kg")
                
            # Waktu Pemesanan Terbaik
            st.markdown('<div class="section-header">📅 Jadwal Pemesanan Rekomendasi (Timing)</div>', unsafe_allow_html=True)
            st.info(f"💡 {recommendation['recommended_purchase_timeline']}")
        else:
            st.error("Tidak dapat menemukan supplier yang cocok untuk volume pengadaan tersebut.")
            
        st.markdown("---")
        st.info("💡 **Tips Pembelian Kolektif:** Gunakan fitur *Collective Buying Power* untuk menggabungkan pesanan dengan koperasi desa tetangga agar total volume meningkat dan mendapatkan tier harga yang jauh lebih murah!")
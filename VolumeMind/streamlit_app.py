import streamlit as st
import pandas as pd
import joblib

# 1. Konfigurasi Halaman (Biar UI-nya luas dan rapi)
st.set_page_config(page_title="VolumeMind AI", page_icon="🌿", layout="centered")

# 2. Load Model (Pake st.cache_resource biar model cuma di-load 1x, gak ngelag)
@st.cache_resource
def load_model():
    return joblib.load('demand_forecasting_model.joblib')

model = load_model()

# 3. Header UI
st.title("🌿 VolumeMind")
st.subheader("Smart Demand Forecasting untuk Koperasi")
st.markdown("---")

# 4. Layout Form Input pake Kolom
col1, col2 = st.columns(2)

with col1:
    st.markdown("**📝 Detail Koperasi & Waktu**")
    # Karena OneHotEncoder lo pake handle_unknown='ignore', lo bebas nambahin Koperasi baru dari Study Case!
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

# 5. Tombol Eksekusi Model
if st.button("🔮 Hitung Prediksi Kebutuhan", use_container_width=True):
    with st.spinner('VolumeMind sedang menganalisis data historis...'):
        
        # Susun dataframe persis kayak bentuk X_train lo
        input_data = pd.DataFrame([{
            'tahun': tahun,
            'bulan': bulan,
            'id_koperasi': koperasi,
            'jenis_pupuk': pupuk,
            'curah_hujan_mm': curah_hujan,
            'musim_tanam': musim,
            'luas_lahan_hektar': luas_lahan
        }])
        
        # Eksekusi Prediksi
        prediksi = model.predict(input_data)[0]
        
        # Tampilkan Hasil yang Cantik
        st.success("Analisis Selesai!")
        
        # Pake st.metric buat nonjolin angkanya
        st.metric(label=f"Rekomendasi Pengadaan {pupuk} ({koperasi})", value=f"{int(prediksi):,} kg")
        
        st.info("💡 **Next Step:** Gabungkan volume ini dengan koperasi tetangga untuk memicu *Collective Buying Power* dan turunkan harga per kilogramnya!")
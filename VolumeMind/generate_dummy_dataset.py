import pandas as pd
import numpy as np
from datetime import datetime

# Set seed for reproducibility
np.random.seed(42)

# Define parameters
start_date = "2021-01-01"
end_date = "2026-06-01"
dates = pd.date_range(start=start_date, end=end_date, freq="MS")

koperasis = [
    {"name": "Koperasi Sumber Makmur", "lahan": 500, "rain_offset": 0},
    {"name": "Koperasi Tani Jaya", "lahan": 300, "rain_offset": 5}
]

pupuk_types = [
    "Pupuk Urea Granul",
    "Pupuk NPK Phonska",
    "Pupuk SP-36 Super",
    "Pupuk ZA",
    "Pupuk Organik Cair"
]

data = []

# Generate sequential rows
for date in dates:
    month = date.month
    year = date.year
    
    # Determine season and rainfall base
    if month in [11, 12, 1, 2, 3]:
        musim = "Rendengan"
        rain_base = 250
    elif month in [4, 5, 6, 7]:
        musim = "Gadu"
        rain_base = 120
    else:
        musim = "Paceklik"
        rain_base = 50
        
    for kop in koperasis:
        # Generate rainfall with seasonal noise
        rain = rain_base + np.random.randint(-30, 30) + kop["rain_offset"]
        rain = max(10, rain)
        
        for pupuk in pupuk_types:
            # Outgoing demand distributed to farmers (based on season/land)
            if "Urea" in pupuk:
                base_qty = 80 * kop["lahan"]
            elif "NPK" in pupuk:
                base_qty = 50 * kop["lahan"]
            else:
                base_qty = 20 * kop["lahan"]
                
            # Season factors
            season_factor = 1.25 if musim == "Rendengan" else (0.85 if musim == "Gadu" else 0.25)
            # Add noise to outgoing
            outgoing_qty = base_qty * season_factor * np.random.uniform(0.9, 1.1)
            outgoing_qty = round(outgoing_qty, 1)
            
            # Incoming procurement (usually slightly higher or matching outgoing with lag/tiers)
            incoming_qty = outgoing_qty * np.random.uniform(0.95, 1.15)
            # Round to make bulk-like purchases (e.g. increments of 50kg bags)
            incoming_qty = round(incoming_qty / 50) * 50
            if incoming_qty < 0:
                incoming_qty = 0
                
            # Prices
            buy_price_per_kg = 8500 if incoming_qty < 5000 else (7800 if incoming_qty < 15000 else 7000)
            sell_price_per_kg = 9000 if "Organik" not in pupuk else 15000
            
            total_cost = incoming_qty * buy_price_per_kg
            total_revenue = outgoing_qty * sell_price_per_kg
            
            data.append({
                "tanggal": date.strftime("%Y-%m-%d"),
                "id_koperasi": kop["name"],
                "jenis_pupuk": pupuk,
                "curah_hujan_mm": rain,
                "musim_tanam": musim,
                "luas_lahan_hektar": kop["lahan"],
                "volume_penyaluran_kg": outgoing_qty,
                "volume_pengadaan_kg": incoming_qty,
                "total_biaya_pengadaan_rp": total_cost,
                "total_pendapatan_rp": total_revenue
            })

df = pd.DataFrame(data)
df.to_csv("volumemate_dataset_updated.csv", index=False)
print("Updated dummy dataset generated successfully and saved to 'volumemate_dataset_updated.csv'")
print(f"Total records generated: {len(df)}")

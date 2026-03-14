# Forecast Monitoring App & Analysis

This project consists of two parts:

1.  **Forecast Monitoring App**: A React-based web application to visualize UK national-level wind power generation (Actuals vs. Forecasts).
2.  **Analysis**: A Jupyter notebook analyzing forecast error characteristics and wind power reliability.

## 1. Forecast Monitoring App

The app allows users to:

- Select a time range within January 2024.
- Adjust the **Forecast Horizon** (0-48 hours) using a slider.
- View a real-time chart comparing Actual Generation (Blue) and the latest Forecast (Green) created at or before the selected horizon.

### Technologies

- **Frontend**: React (TypeScript), Vite, Tailwind CSS.
- **Charts**: Recharts.
- **Icons**: Lucide React.
- **Deployment**: Can be deployed to Vercel/Netlify by connecting this repository.

### Setup & Run

```bash
cd app
npm install
npm run dev
```

---

## 2. Analysis

The analysis is performed on wind generation data for January 2024.

### Key Findings

- **Error Characteristics**: MAE, Median, and P99 error metrics are calculated for various horizons. Accuracy significantly degrades as the horizon increases from 1h to 48h.
- **Reliability Recommendation**: Based on the P90 generation level (the value exceeded 90% of the time), a reliable "firm" capacity for wind in Jan 2024 was identified.

### Setup & Run

```bash
# Install dependencies
python3 -m pip install pandas numpy matplotlib seaborn nbformat

# Fetch data (if not already present in data/)
python3 scripts/fetch_data.py

# View the notebook
# The notebook is located at analysis/analysis.ipynb
```

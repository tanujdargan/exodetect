# ExoDetect 🛰️

AI-powered exoplanet detection and classification system using machine learning models trained on NASA Kepler mission data.

## Overview

ExoDetect is a full-stack application that combines a Next.js frontend with a FastAPI backend to analyze light curve data and classify potential exoplanets. The system supports multiple prediction modes and uses ensemble ML models for high-accuracy classification.

## Features

- 🔍 **Multiple Prediction Modes**
  - **Upload Mode**: Upload CSV or FITS light curve files for analysis
  - **Researcher Mode**: Advanced search with custom column selection and detrending
  - **Explorer Mode**: Quick search with archive metadata display

- 🤖 **Machine Learning Models**
  - XGBoost Enhanced (default, recommended)
  - LightGBM, Random Forest, Gradient Boosting
  - Neural Networks, SVM, Logistic Regression
  - 11 pre-trained models available

- 📊 **Rich Analysis Features**
  - Transit detection using Box Least Squares (BLS)
  - Feature importance visualization
  - Confidence indicators
  - Human-readable reasoning
  - Archive metadata integration

- 🔐 **Authentication & Logging**
  - User authentication system
  - MongoDB integration for query logging
  - Analytics dashboard

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Shadcn/ui
- **Charts**: Recharts
- **Animations**: Framer Motion

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.8+
- **ML Libraries**: XGBoost, LightGBM, scikit-learn
- **Astronomy**: Astropy, Lightkurve, Astroquery
- **Database**: MongoDB (optional)
- **Processing**: NumPy, Pandas, SciPy

## Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB (optional, for authentication/logging)

### Backend Setup

```bash
cd exodetect_backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (optional)
cp .env.example .env
# Edit .env with your MongoDB URI and other settings

# Start the server
python -m uvicorn src.api.api_server:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Install dependencies
npm install

# Set environment variable
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Usage

### Upload Mode

Upload your own light curve data:

1. Navigate to Upload Mode
2. Upload a CSV or FITS file
   - CSV format: `time,flux,flux_err` columns
   - FITS format: Standard Kepler/TESS light curve format
3. Optional: Set a custom target ID
4. Click "Run Classification"

**Sample Files**: Use the provided high-quality samples in `sample_data/`:
- `hot_jupiter_lc.csv` / `.fits` - 25 transits, easy detection ⭐ **BEST**
- `super_earth_lc.csv` / `.fits` - 10 transits, moderate
- `earth_like_lc.csv` / `.fits` - 7 transits, challenging

### Researcher Mode

Advanced search with customization:

1. Enter a KOI target (e.g., `KOI-7.01`)
2. Select transit and stellar parameter columns
3. Choose detrending method (Median, Spline, or None)
4. Optional: Configure transit search (BLS/TLS)
5. Click "Analyze"

### Explorer Mode

Quick archive search:

1. Enter a KOI or KIC target
2. Toggle archive data options (disposition, score, flags)
3. Click "Search"
4. View classification results with archive metadata

## Valid Test Targets

### Confirmed Exoplanets (KOI IDs)

These are guaranteed to work:

- `KOI-7.01` or `K00007.01` - Kepler-7 b (Hot Jupiter)
- `KOI-1.01` or `K00001.01` - TrES-2 b (Hot Jupiter)
- `KOI-268.01` or `K00268.01` - Kepler-10 b (Rocky planet)
- `KOI-94.01` or `K00094.01` - Kepler-5 b
- `KOI-3.01` or `K00003.01` - Kepler-6 b

### KIC IDs with KOIs

These KIC IDs have associated planet candidates:

- `KIC-11853905` (has KOI-7.01)
- `KIC-10666592` (has KOI-1.01)
- `KIC-11904151` (has KOI-268.01)

**Note**: Not all KIC IDs will work. KIC IDs without planet candidates (KOI designations) may not have sufficient data for classification unless light curve data is available from MAST.

## API Endpoints

### Health Check
```
GET /health
```

### Upload Prediction
```
POST /api/predict/upload
Content-Type: multipart/form-data

Parameters:
- file: CSV or FITS file
- target_id: (optional) Custom target ID
- mission: (optional) Mission name
- model_name: (optional) Model to use
```

### Archive Prediction
```
POST /api/predict/archive
Content-Type: application/json

Body:
{
  "identifier": "KOI-7.01",
  "mission": "Kepler",
  "include_light_curve": false
}
```

### Light Curve Prediction
```
POST /api/predict/light-curve
Content-Type: application/json

Body:
{
  "time": [0.0, 0.02, ...],
  "flux": [1.0001, 0.9999, ...],
  "flux_err": [0.0001, 0.0001, ...]
}
```

### Features Prediction
```
POST /api/predict/features
Content-Type: application/json

Body:
{
  "period": 10.5,
  "duration": 3.2,
  "depth": 500,
  "snr": 15.0
}
```

## Project Structure

```
exodetect/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   │   ├── upload-mode.tsx
│   │   ├── researcher-mode.tsx
│   │   └── explorer-mode.tsx
│   └── lib/              # Utilities and API client
├── sample_data/          # Sample light curves for testing
│   ├── hot_jupiter_lc.csv
│   ├── super_earth_lc.csv
│   └── earth_like_lc.csv
└── exodetect_backend/
    ├── src/
    │   ├── api/          # FastAPI routes
    │   ├── ml/           # ML models and processors
    │   ├── utils/        # Archive fetcher, utilities
    │   ├── auth/         # Authentication system
    │   └── database/     # MongoDB integration
    └── models/           # Pre-trained ML models (.pkl files)
```

## Models

The system includes 11 pre-trained models:

- `xgboost_enhanced_model.pkl` ⭐ (default)
- `gradient_boost_enhanced_model.pkl`
- `lightgbm_enhanced_model.pkl`
- `random_forest_enhanced_model.pkl`
- Plus 7 additional models

All models are trained on NASA Kepler cumulative KOI table with features including:
- Transit parameters (period, duration, depth, SNR)
- Stellar parameters (Teff, logg, radius, mass)
- Vetting flags and secondary metrics

## Testing

### Backend Tests
```bash
cd exodetect_backend
python test_system.py
```

### Quick Backend Test
```bash
python test_backend.py
```

This will test:
- Health endpoint
- Archive prediction
- File upload prediction

### Frontend Testing
```bash
npm run build
npm run start
```

## Environment Variables

### Backend (.env)
```bash
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=exodetect
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
ENABLE_SCHEDULER=false
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

### Backend Deployment (Railway/Heroku)

1. Set environment variables in platform dashboard
2. Deploy from GitHub repository
3. Ensure `requirements.txt` is present
4. Set start command: `uvicorn src.api.api_server:app --host 0.0.0.0 --port $PORT`

### Frontend Deployment (Vercel/Netlify)

1. Connect GitHub repository
2. Set `NEXT_PUBLIC_API_URL` to production backend URL
3. Build command: `npm run build`
4. Output directory: `.next`

## Troubleshooting

### "No prediction data available for [KIC ID]"
- Not all KIC IDs have planet candidates
- Try using a KOI ID instead (e.g., `KOI-7.01`)
- Or upload a light curve file directly

### "Could not fetch light curve"
- This is normal and expected
- System automatically falls back to using archive parameters
- Predictions still work correctly

### Upload shows "Period: 0, Depth: 0"
- Light curve doesn't have enough transits for detection
- Use provided sample files in `sample_data/` for testing
- Ensure file has multiple transits over sufficient baseline

### Backend connection errors
- Verify backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure no firewall blocking connections

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- NASA Exoplanet Archive for providing the Kepler data
- Kepler Space Telescope mission team
- Astropy, Lightkurve, and Astroquery communities

## Contact

For questions or issues, please open an issue on GitHub.

---

**Built with ❤️ for exoplanet discovery**

# Sample Data for ExoDetect Testing

This directory contains sample light curve data files for testing the ExoDetect upload functionality.

## Files

### 1. `kepler_light_curve_sample.csv`
- **Format**: CSV with columns: `time`, `flux`, `flux_err`
- **Object**: K00007.01 (Kepler Object of Interest)
- **KIC ID**: 11853905
- **Mission**: Kepler
- **Data Points**: 539
- **Time Range**: ~11 days
- **Features**: Contains a simulated transit event around day 10

### 2. `kepler_light_curve_sample.fits`
- **Format**: FITS Binary Table (standard Kepler format)
- **Object**: K00007.01 (Kepler Object of Interest)
- **KIC ID**: 11853905
- **Mission**: Kepler
- **Extensions**:
  - Primary HDU: Header with metadata
  - Binary Table HDU: Light curve data with columns `TIME`, `PDCSAP_FLUX`, `PDCSAP_FLUX_ERR`
- **Data Points**: 539
- **Time Range**: ~11 days
- **Features**: Contains a simulated transit event around day 10

## Usage

### Upload Mode Testing
1. Navigate to the ExoDetect dashboard
2. Select "Upload Mode"
3. Upload either the CSV or FITS file
4. The system will:
   - Parse the file
   - Extract light curve data
   - Detect the transit event
   - Run classification with the backend ML model
   - Display prediction results

### Expected Results
- The light curve contains a transit-like dip around day 10.0
- Transit depth: ~0.8% (8000 ppm)
- Duration: ~0.4 days (~9.6 hours)
- The model should detect this as a potential exoplanet candidate

## Data Characteristics

### Baseline Flux
- Mean flux: ~1.0000 (normalized)
- Scatter: ~0.0001 (100 ppm)
- Typical error: ~0.00012 (120 ppm)

### Transit Event (days 10.0 - 10.4)
- Depth: ~0.008 (8000 ppm)
- Shape: Box-like with slight ingress/egress
- Increased errors during transit

## Generating Custom Sample Data

To create your own FITS file from the CSV:
```bash
python create_fits_sample.py
```

This script uses `astropy` to convert the CSV data into a proper Kepler-format FITS file with appropriate headers and metadata.

## Real Exoplanet Testing

For testing with real exoplanet data, you can use:
- **Explorer Mode**: Search for "K00007.01" or "KIC 11853905"
- **Researcher Mode**: Search for "KOI-7.01" with custom column selection

These will fetch actual data from the NASA Exoplanet Archive.

## Notes

- The sample data is synthetic but follows realistic Kepler light curve characteristics
- Transit parameters are typical for a hot Jupiter
- Both files contain identical time-series data in different formats
- Files are small enough for quick testing (~50KB each)

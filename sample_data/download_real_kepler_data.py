"""
Download real Kepler light curve data from NASA archives
Uses lightkurve to fetch actual exoplanet transit data
"""
import lightkurve as lk
import numpy as np
import pandas as pd
from astropy.io import fits
import warnings
warnings.filterwarnings('ignore')

def download_kepler_lightcurve(target_name, output_prefix="kepler_real"):
    """
    Download real Kepler light curve data

    Parameters:
    -----------
    target_name : str
        Target identifier (e.g., 'KIC 11853905', 'Kepler-7')
    output_prefix : str
        Prefix for output files
    """
    print(f"🔍 Searching for {target_name} in Kepler archive...")

    # Search for the target
    search_result = lk.search_lightcurve(target_name, mission='Kepler')

    if len(search_result) == 0:
        print(f"❌ No data found for {target_name}")
        return False

    print(f"✅ Found {len(search_result)} quarters of data")
    print(f"   Downloading first quarter...")

    # Download the first quarter with best quality
    lc = search_result[0].download()

    if lc is None:
        print("❌ Failed to download light curve")
        return False

    print(f"✅ Downloaded light curve")
    print(f"   Mission: {lc.meta.get('MISSION', 'Unknown')}")
    print(f"   Target: {lc.meta.get('OBJECT', target_name)}")
    print(f"   Cadence: {lc.meta.get('OBSMODE', 'Unknown')}")
    print(f"   Data points: {len(lc.time)}")

    # Remove NaNs and normalize
    lc = lc.remove_nans().normalize()

    # Get time, flux, and flux_err
    time = lc.time.value  # BJD - 2454833
    flux = lc.flux.value
    flux_err = lc.flux_err.value

    print(f"   Clean data points: {len(time)}")
    print(f"   Time range: {time.min():.2f} - {time.max():.2f} days")
    print(f"   Duration: {time.max() - time.min():.2f} days")

    # Save as CSV
    csv_filename = f"{output_prefix}_lc.csv"
    df = pd.DataFrame({
        'time': time,
        'flux': flux,
        'flux_err': flux_err
    })
    df.to_csv(csv_filename, index=False)
    print(f"✅ Saved CSV: {csv_filename}")

    # Save as FITS (standard Kepler format)
    fits_filename = f"{output_prefix}_lc.fits"

    # Create FITS table columns
    col1 = fits.Column(name='TIME', format='D', array=time, unit='BJD - 2454833')
    col2 = fits.Column(name='PDCSAP_FLUX', format='D', array=flux)
    col3 = fits.Column(name='PDCSAP_FLUX_ERR', format='D', array=flux_err)

    # Create Binary Table HDU
    cols = fits.ColDefs([col1, col2, col3])
    table_hdu = fits.BinTableHDU.from_columns(cols)

    # Create Primary HDU with header
    primary_hdu = fits.PrimaryHDU()
    primary_hdu.header['OBJECT'] = lc.meta.get('OBJECT', target_name)
    primary_hdu.header['KEPLERID'] = lc.meta.get('KEPLERID', 0)
    primary_hdu.header['OBSMODE'] = lc.meta.get('OBSMODE', 'long cadence')
    primary_hdu.header['MISSION'] = 'Kepler'
    primary_hdu.header['TELESCOP'] = 'Kepler'
    primary_hdu.header['INSTRUME'] = 'Kepler Photometer'
    primary_hdu.header['QUARTER'] = lc.meta.get('QUARTER', 1)
    primary_hdu.header['BJDREFI'] = 2454833
    primary_hdu.header['BJDREFF'] = 0.0
    primary_hdu.header['TIMEUNIT'] = 'd'
    primary_hdu.header['TSTART'] = time.min()
    primary_hdu.header['TSTOP'] = time.max()
    primary_hdu.header['CREATOR'] = 'lightkurve'

    # Add table header info
    table_hdu.header['EXTNAME'] = 'LIGHTCURVE'

    # Create HDU list and write
    hdul = fits.HDUList([primary_hdu, table_hdu])
    hdul.writeto(fits_filename, overwrite=True)
    print(f"✅ Saved FITS: {fits_filename}")

    # Print statistics
    print(f"\n📊 Light Curve Statistics:")
    print(f"   Mean flux: {flux.mean():.6f}")
    print(f"   Std dev: {flux.std():.6f}")
    print(f"   Median error: {np.median(flux_err):.6f}")

    # Try to detect transits
    try:
        print(f"\n🔍 Running transit search...")
        from astropy.timeseries import BoxLeastSquares

        model = BoxLeastSquares(time, flux, flux_err)
        periods = np.linspace(0.5, 20, 5000)
        results = model.power(periods, 0.05)

        best_idx = np.argmax(results.power)
        best_period = results.period[best_idx]
        best_depth = results.depth[best_idx]
        best_duration = results.duration[best_idx]

        print(f"   Detected period: {best_period:.4f} days")
        print(f"   Transit depth: {best_depth * 1e6:.0f} ppm")
        print(f"   Transit duration: {best_duration * 24:.2f} hours")
        print(f"   Power: {results.power[best_idx]:.4f}")

    except Exception as e:
        print(f"   Transit search failed: {e}")

    return True

def main():
    """Download sample light curves for known exoplanets"""
    print("=" * 60)
    print("🛰️  Real Kepler Light Curve Downloader")
    print("=" * 60)
    print()

    # List of interesting targets with confirmed transits
    targets = [
        ('Kepler-7', 'kepler7'),           # Hot Jupiter, deep transits
        ('KIC 11853905', 'kic11853905'),   # K00007.01
        ('Kepler-10', 'kepler10'),         # Rocky planet
    ]

    print("Available targets:")
    for i, (name, _) in enumerate(targets, 1):
        print(f"  {i}) {name}")
    print(f"  {len(targets) + 1}) Custom target")
    print()

    try:
        choice = input("Select target [1-4] or press Enter for default (1): ").strip()

        if not choice:
            choice = "1"

        choice = int(choice)

        if 1 <= choice <= len(targets):
            target_name, prefix = targets[choice - 1]
        elif choice == len(targets) + 1:
            target_name = input("Enter target name (e.g., 'Kepler-7', 'KIC 11853905'): ").strip()
            prefix = "custom"
        else:
            print("Invalid choice")
            return

        print()
        success = download_kepler_lightcurve(target_name, prefix)

        if success:
            print()
            print("=" * 60)
            print("✅ SUCCESS! Files ready for upload testing")
            print("=" * 60)
            print()
            print("Next steps:")
            print("  1. Start backend: cd ../exodetect_backend && python -m uvicorn ...")
            print("  2. Start frontend: npm run dev")
            print(f"  3. Upload {prefix}_lc.csv or {prefix}_lc.fits in Upload Mode")
            print()
        else:
            print()
            print("=" * 60)
            print("❌ Failed to download data")
            print("=" * 60)

    except KeyboardInterrupt:
        print("\n\nCancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()

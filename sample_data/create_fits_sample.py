"""
Generate a sample FITS file with light curve data for testing
This creates a FITS file compatible with standard Kepler/TESS light curve format
"""
import numpy as np
from astropy.io import fits
from astropy.table import Table
import pandas as pd

# Read the CSV data
csv_file = 'kepler_light_curve_sample.csv'
df = pd.read_csv(csv_file)

# Create FITS table columns
time_col = fits.Column(name='TIME', format='D', array=df['time'].values, unit='BJD - 2454833')
flux_col = fits.Column(name='PDCSAP_FLUX', format='D', array=df['flux'].values)
flux_err_col = fits.Column(name='PDCSAP_FLUX_ERR', format='D', array=df['flux_err'].values)

# Create Binary Table HDU
cols = fits.ColDefs([time_col, flux_col, flux_err_col])
table_hdu = fits.BinTableHDU.from_columns(cols)

# Create Primary HDU with header info
primary_hdu = fits.PrimaryHDU()
primary_hdu.header['OBJECT'] = 'K00007.01'
primary_hdu.header['KEPLERID'] = 11853905
primary_hdu.header['OBSMODE'] = 'long cadence'
primary_hdu.header['MISSION'] = 'Kepler'
primary_hdu.header['TELESCOP'] = 'Kepler'
primary_hdu.header['INSTRUME'] = 'Kepler Photometer'
primary_hdu.header['CHANNEL'] = 84
primary_hdu.header['MODULE'] = 24
primary_hdu.header['OUTPUT'] = 4
primary_hdu.header['QUARTER'] = 1
primary_hdu.header['SEASON'] = 0
primary_hdu.header['DATA_REL'] = 32
primary_hdu.header['TIMESYS'] = 'TDB'
primary_hdu.header['BJDREFI'] = 2454833
primary_hdu.header['BJDREFF'] = 0.0
primary_hdu.header['TIMEUNIT'] = 'd'
primary_hdu.header['TSTART'] = df['time'].min()
primary_hdu.header['TSTOP'] = df['time'].max()
primary_hdu.header['DATE-OBS'] = '2009-05-02'
primary_hdu.header['DATE-END'] = '2009-08-03'
primary_hdu.header['CREATOR'] = 'ExoDetect Sample Generator'
primary_hdu.header['ORIGIN'] = 'ExoDetect'

# Add table header info
table_hdu.header['EXTNAME'] = 'LIGHTCURVE'
table_hdu.header['TTYPE1'] = 'TIME'
table_hdu.header['TFORM1'] = 'D'
table_hdu.header['TUNIT1'] = 'BJD - 2454833'
table_hdu.header['TDISP1'] = 'D14.7'
table_hdu.header['TTYPE2'] = 'PDCSAP_FLUX'
table_hdu.header['TFORM2'] = 'D'
table_hdu.header['TTYPE3'] = 'PDCSAP_FLUX_ERR'
table_hdu.header['TFORM3'] = 'D'

# Create HDU list and write to file
hdul = fits.HDUList([primary_hdu, table_hdu])
output_file = 'kepler_light_curve_sample.fits'
hdul.writeto(output_file, overwrite=True)

print(f"✅ FITS file created: {output_file}")
print(f"   Object: K00007.01 (KIC 11853905)")
print(f"   Data points: {len(df)}")
print(f"   Time range: {df['time'].min():.3f} - {df['time'].max():.3f} days")
print(f"   Mission: Kepler")
print(f"\nYou can now use this file to test the upload functionality!")

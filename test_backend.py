#!/usr/bin/env python3
"""
Quick test script to verify ExoDetect backend is working
"""
import requests
import json
import os

# Backend URL
API_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")

def test_health():
    """Test health endpoint"""
    print("=" * 50)
    print("Testing Health Endpoint")
    print("=" * 50)
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is healthy!")
            print(f"   Available models: {', '.join(data.get('available_models', []))}")
            print(f"   Timestamp: {data.get('timestamp')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Could not connect to backend: {e}")
        print(f"   Make sure backend is running at: {API_URL}")
        return False

def test_archive_prediction():
    """Test archive prediction endpoint"""
    print("\n" + "=" * 50)
    print("Testing Archive Prediction")
    print("=" * 50)
    try:
        payload = {
            "identifier": "K00007.01",
            "mission": "Kepler",
            "include_light_curve": False
        }

        response = requests.post(
            f"{API_URL}/api/predict/archive",
            json=payload,
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Archive prediction successful!")
            print(f"   Target: {data.get('target')}")
            print(f"   Probability: {data.get('model_probability_candidate', 0):.4f}")
            print(f"   Label: {data.get('model_label')}")
            print(f"   Confidence: {data.get('confidence')}")
            print(f"   Model: {data.get('model_name')}")
            print(f"   Processing time: {data.get('processing_time', 0):.2f}s")
            return True
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_upload():
    """Test file upload endpoint"""
    print("\n" + "=" * 50)
    print("Testing File Upload")
    print("=" * 50)

    # Use the high-quality synthetic sample with multiple transits
    csv_file = "sample_data/hot_jupiter_lc.csv"

    # Fallback to original sample if hot jupiter not available
    if not os.path.exists(csv_file):
        csv_file = "sample_data/kepler_light_curve_sample.csv"

    if not os.path.exists(csv_file):
        print(f"❌ Sample file not found: {csv_file}")
        return False

    try:
        with open(csv_file, 'rb') as f:
            files = {'file': ('test_light_curve.csv', f, 'text/csv')}
            data = {
                'target_id': 'TEST-001',
                'mission': 'Kepler'
            }

            response = requests.post(
                f"{API_URL}/api/predict/upload",
                files=files,
                data=data,
                timeout=60
            )

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Upload prediction successful!")
            print(f"   Target: {result.get('target')}")
            print(f"   Probability: {result.get('model_probability_candidate', 0):.4f}")
            print(f"   Label: {result.get('model_label')}")
            print(f"   Confidence: {result.get('confidence')}")
            print(f"   Processing time: {result.get('processing_time', 0):.2f}s")

            if result.get('transit_params'):
                print(f"   Transit detected:")
                params = result['transit_params']
                print(f"      Period: {params.get('period_days', 0):.2f} days")
                print(f"      Duration: {params.get('duration_hours', 0):.2f} hours")
                print(f"      Depth: {params.get('depth_ppm', 0):.0f} ppm")

            return True
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except FileNotFoundError:
        print(f"❌ File not found: {csv_file}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 50)
    print("ExoDetect Backend Test Suite")
    print("=" * 50)
    print(f"Testing backend at: {API_URL}\n")

    results = {
        "Health Check": test_health(),
        "Archive Prediction": False,
        "File Upload": False
    }

    # Only run other tests if health check passes
    if results["Health Check"]:
        results["Archive Prediction"] = test_archive_prediction()
        results["File Upload"] = test_upload()

    # Summary
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)

    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")

    all_passed = all(results.values())
    print("\n" + "=" * 50)
    if all_passed:
        print("✅ All tests passed! Backend is ready.")
    else:
        print("❌ Some tests failed. Check the output above.")
    print("=" * 50 + "\n")

    return 0 if all_passed else 1

if __name__ == "__main__":
    exit(main())

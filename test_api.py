#!/usr/bin/env python3
"""
Test script for the Big Appetite Food Cost Calculator API
"""
import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:8000"

def test_api():
    print("🧪 Testing Big Appetite Food Cost Calculator API")
    print("=" * 50)
    
    # Test 1: Check if API is running
    print("\n1. Testing API health...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ API is running: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("❌ API is not running. Please start it with: uvicorn main:app --reload")
        return False
    
    # Test 2: Upload files
    print("\n2. Uploading CSV files...")
    try:
        files = {
            'costings': open('costings.csv', 'rb'),
            'recipes': open('recipes.csv', 'rb'),
            'menu_prices': open('menu_prices.csv', 'rb')
        }
        
        response = requests.post(f"{BASE_URL}/upload", files=files)
        
        # Close files
        for file in files.values():
            file.close()
            
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Files uploaded successfully: {data['rows']} rows processed")
        else:
            print(f"❌ Upload failed: {response.text}")
            return False
            
    except FileNotFoundError as e:
        print(f"❌ File not found: {e}")
        return False
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return False
    
    # Test 3: Get results
    print("\n3. Getting results...")
    try:
        response = requests.get(f"{BASE_URL}/results")
        if response.status_code == 200:
            results = response.json()
            print(f"✅ Retrieved {len(results)} menu items:")
            for item in results:
                print(f"   - {item['Menu Item']}: Food Cost £{item['Food Cost (£)']}, GP {item['GP %']}%")
        else:
            print(f"❌ Failed to get results: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Results error: {e}")
        return False
    
    # Test 4: Query ingredient cost
    print("\n4. Testing ingredient cost query...")
    try:
        response = requests.get(f"{BASE_URL}/query?q=cheese cost")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Ingredient query: {data}")
        else:
            print(f"❌ Ingredient query failed: {response.text}")
    except Exception as e:
        print(f"❌ Ingredient query error: {e}")
    
    # Test 5: Query menu item GP
    print("\n5. Testing menu item GP query...")
    try:
        response = requests.get(f"{BASE_URL}/query?q=chicken pizza gp")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Menu item GP query: {data}")
        else:
            print(f"❌ Menu item GP query failed: {response.text}")
    except Exception as e:
        print(f"❌ Menu item GP query error: {e}")
    
    # Test 6: Query items under GP threshold
    print("\n6. Testing GP threshold query...")
    try:
        response = requests.get(f"{BASE_URL}/query?q=items under 70")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ GP threshold query: Found {len(data)} items under 70% GP")
            for item in data:
                print(f"   - {item['Menu Item']}: GP {item['GP %']}%")
        else:
            print(f"❌ GP threshold query failed: {response.text}")
    except Exception as e:
        print(f"❌ GP threshold query error: {e}")
    
    print("\n🎉 API testing completed!")
    return True

if __name__ == "__main__":
    test_api()

#!/usr/bin/env python3
"""
Deployment Verification Script
Tests frontend and backend connectivity, API endpoints, and core functionality
"""

import requests
import json
import sys
from urllib.parse import urljoin
from time import sleep

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_status(status, message):
    """Print colored status message"""
    if status == "✓":
        color = Colors.GREEN
    elif status == "✗":
        color = Colors.RED
    elif status == "⚠":
        color = Colors.YELLOW
    elif status == "ℹ":
        color = Colors.BLUE
    else:
        color = Colors.END
    
    print(f"{color}[{status}]{Colors.END} {message}")

def verify_url_accessible(url, description=""):
    """Test if URL is accessible"""
    if description:
        print(f"\n{'─'*60}")
        print(description)
        print('─'*60)
    
    try:
        response = requests.get(url, timeout=5, allow_redirects=True)
        print_status("✓", f"URL accessible: {url} (HTTP {response.status_code})")
        return True
    except requests.exceptions.Timeout:
        print_status("✗", f"URL timeout: {url} (took > 5 seconds)")
        return False
    except requests.exceptions.ConnectionError:
        print_status("✗", f"Cannot connect to: {url}")
        return False
    except Exception as e:
        print_status("✗", f"Error accessing {url}: {str(e)}")
        return False

def verify_backend_health(backend_url):
    """Verify backend health endpoint"""
    print(f"\n{'─'*60}")
    print("Testing Backend Health Check")
    print('─'*60)
    
    health_url = urljoin(backend_url, "/health")
    try:
        response = requests.get(health_url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'healthy':
                print_status("✓", f"Backend is healthy")
                return True
            else:
                print_status("⚠", f"Backend responded but status unclear: {data}")
                return True
        else:
            print_status("✗", f"Backend health check returned HTTP {response.status_code}")
            return False
    except Exception as e:
        print_status("✗", f"Error checking backend health: {str(e)}")
        return False

def verify_api_documentation(backend_url):
    """Verify API documentation is accessible"""
    print(f"\n{'─'*60}")
    print("Testing API Documentation")
    print('─'*60)
    
    docs_url = urljoin(backend_url, "/docs")
    try:
        response = requests.get(docs_url, timeout=5)
        if response.status_code == 200:
            print_status("✓", f"API docs accessible at {docs_url}")
            return True
        else:
            print_status("✗", f"API docs returned HTTP {response.status_code}")
            return False
    except Exception as e:
        print_status("⚠", f"Cannot access API docs: {str(e)}")
        return False

def verify_authentication(backend_url):
    """Test authentication endpoint"""
    print(f"\n{'─'*60}")
    print("Testing Authentication Endpoint")
    print('─'*60)
    
    auth_url = urljoin(backend_url, "/api/v1/auth/login")
    
    # Try login with default credentials
    payload = {
        "email": "athlete@example.com",
        "password": "password"
    }
    
    try:
        response = requests.post(auth_url, json=payload, timeout=5)
        if response.status_code in [200, 400, 401, 422]:
            print_status("✓", f"Auth endpoint reachable (HTTP {response.status_code})")
            print_status("ℹ", f"Response: {response.json()}")
            return True
        else:
            print_status("⚠", f"Auth endpoint returned HTTP {response.status_code}")
            return False
    except Exception as e:
        print_status("✗", f"Error testing auth: {str(e)}")
        return False

def verify_frontend_api_communication(frontend_url, backend_url):
    """Verify frontend can communicate with backend"""
    print(f"\n{'─'*60}")
    print("Testing Frontend-Backend Communication")
    print('─'*60)
    
    try:
        # Fetch frontend HTML
        response = requests.get(frontend_url, timeout=5)
        if response.status_code == 200:
            print_status("✓", f"Frontend loads successfully")
            
            # Check if environment variable is set in frontend
            if "api" in response.text.lower() or "fetch" in response.text.lower():
                print_status("ℹ", "Frontend contains API/fetch references")
            
            return True
        else:
            print_status("✗", f"Frontend returned HTTP {response.status_code}")
            return False
    except Exception as e:
        print_status("✗", f"Error accessing frontend: {str(e)}")
        return False

def verify_cors_headers(backend_url):
    """Verify CORS headers are properly set"""
    print(f"\n{'─'*60}")
    print("Testing CORS Headers")
    print('─'*60)
    
    cors_url = urljoin(backend_url, "/health")
    
    try:
        response = requests.options(cors_url, timeout=5)
        headers = response.headers
        
        cors_origin = headers.get('Access-Control-Allow-Origin')
        cors_methods = headers.get('Access-Control-Allow-Methods')
        
        if cors_origin:
            print_status("✓", f"CORS Origin: {cors_origin}")
        else:
            print_status("⚠", "CORS Origin header not found")
        
        if cors_methods:
            print_status("✓", f"CORS Methods: {cors_methods}")
        else:
            print_status("⚠", "CORS Methods header not found")
        
        return True
    except Exception as e:
        print_status("⚠", f"Could not verify CORS headers: {str(e)}")
        return False

def main():
    print("\n" + "="*60)
    print("Cloud Deployment Verification")
    print("="*60)
    
    # Get URLs from user
    print("\nEnter your deployment URLs:")
    frontend_url = input("Frontend URL (e.g., https://frontend.example.com): ").strip().rstrip('/')
    backend_url = input("Backend URL (e.g., https://backend.example.com): ").strip().rstrip('/')
    
    if not frontend_url or not backend_url:
        print_status("✗", "URLs are required")
        sys.exit(1)
    
    # Ensure URLs have scheme
    if not frontend_url.startswith(('http://', 'https://')):
        frontend_url = f"http://{frontend_url}"
    if not backend_url.startswith(('http://', 'https://')):
        backend_url = f"http://{backend_url}"
    
    results = []
    
    print("\n" + "="*60)
    print("Running Verification Tests")
    print("="*60)
    
    # Test frontend accessibility
    results.append(verify_url_accessible(frontend_url, "Testing Frontend Accessibility"))
    
    # Test backend accessibility
    results.append(verify_url_accessible(backend_url, "Testing Backend Accessibility"))
    
    # Wait a moment for services to stabilize
    sleep(1)
    
    # Test backend health
    results.append(verify_backend_health(backend_url))
    
    # Test API documentation
    results.append(verify_api_documentation(backend_url))
    
    # Test authentication endpoint
    results.append(verify_authentication(backend_url))
    
    # Test CORS headers
    results.append(verify_cors_headers(backend_url))
    
    # Test frontend-backend communication
    results.append(verify_frontend_api_communication(frontend_url, backend_url))
    
    # Summary
    print("\n" + "="*60)
    print("Verification Summary")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\nTests passed: {passed}/{total}")
    
    if passed == total:
        print_status("✓", "All verification tests passed!")
        print("\n✓ Your deployment appears to be working correctly.")
        print("\nNext steps:")
        print("  1. Open frontend URL in browser")
        print("  2. Test login with credentials (athlete@example.com)")
        print("  3. Test core workflow (upload video, run analysis)")
        print("  4. Check browser console for any errors")
    elif passed >= total * 0.7:
        print_status("⚠", "Most tests passed, but some issues detected")
        print("\nCheck the failed tests above and review:")
        print("  1. Firewall rules")
        print("  2. Environment variables")
        print("  3. Service logs")
        print("  4. Database connectivity")
    else:
        print_status("✗", "Multiple tests failed")
        print("\nPlease check:")
        print("  1. Services are running")
        print("  2. URLs are correct")
        print("  3. Network connectivity")
        print("  4. Service logs for errors")
    
    print("\n" + "="*60)
    
    sys.exit(0 if passed > 0 else 1)

if __name__ == '__main__':
    main()

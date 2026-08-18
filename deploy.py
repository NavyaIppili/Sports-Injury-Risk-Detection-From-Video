#!/usr/bin/env python3
"""
Quick deployment script for Sports Injury Risk Detection Platform
Supports: Google Cloud Run, Azure Container Instances, VPS
"""

import subprocess
import os
import sys
from pathlib import Path

def run_command(cmd, description=""):
    """Run a shell command and return output"""
    if description:
        print(f"\n{'='*60}")
        print(f">>> {description}")
        print(f"{'='*60}")
    
    print(f"$ {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=False, text=True)
    return result.returncode == 0

def check_prerequisites():
    """Check if required tools are installed"""
    print("\nChecking prerequisites...")
    
    tools = {
        'docker': 'Docker',
        'docker-compose': 'Docker Compose',
    }
    
    missing = []
    for cmd, name in tools.items():
        result = subprocess.run(f"{cmd} --version", shell=True, capture_output=True)
        if result.returncode == 0:
            print(f"  ✓ {name} installed")
        else:
            print(f"  ✗ {name} NOT found")
            missing.append(name)
    
    if 'gcloud' in sys.argv[1:]:
        result = subprocess.run("gcloud --version", shell=True, capture_output=True)
        if result.returncode == 0:
            print(f"  ✓ Google Cloud SDK installed")
        else:
            print(f"  ✗ Google Cloud SDK NOT found")
            missing.append("Google Cloud SDK")
    
    if missing:
        print(f"\n❌ Missing tools: {', '.join(missing)}")
        return False
    
    return True

def build_images():
    """Build Docker images"""
    print("\n" + "="*60)
    print("Building Docker images...")
    print("="*60)
    
    success = True
    
    if not run_command(
        "docker build -f backend/Dockerfile.cloud -t sports-injury-backend:latest .",
        "Building backend image..."
    ):
        print("❌ Failed to build backend image")
        success = False
    
    if not run_command(
        "docker build -f frontend/Dockerfile.cloud -t sports-injury-frontend:latest frontend/",
        "Building frontend image..."
    ):
        print("❌ Failed to build frontend image")
        success = False
    
    return success

def deploy_gcloud():
    """Deploy to Google Cloud Run"""
    print("\n" + "="*60)
    print("Deploying to Google Cloud Run...")
    print("="*60)
    
    # Check GCP project ID
    project_id = os.getenv('GCP_PROJECT_ID')
    if not project_id:
        print("❌ GCP_PROJECT_ID environment variable not set")
        print("   Usage: GCP_PROJECT_ID=your-project python3 deploy.py gcloud")
        return False
    
    region = os.getenv('GCP_REGION', 'us-central1')
    
    print(f"\nDeploying to GCP Project: {project_id}")
    print(f"Region: {region}")
    
    # Configure Docker
    if not run_command(f"gcloud auth configure-docker gcr.io", "Configuring Docker for GCR..."):
        return False
    
    # Push images
    if not run_command(
        f"docker tag sports-injury-backend:latest gcr.io/{project_id}/sports-injury-backend:latest",
        "Tagging backend image..."
    ):
        return False
    
    if not run_command(
        f"docker push gcr.io/{project_id}/sports-injury-backend:latest",
        "Pushing backend image to GCR..."
    ):
        return False
    
    if not run_command(
        f"docker tag sports-injury-frontend:latest gcr.io/{project_id}/sports-injury-frontend:latest",
        "Tagging frontend image..."
    ):
        return False
    
    if not run_command(
        f"docker push gcr.io/{project_id}/sports-injury-frontend:latest",
        "Pushing frontend image to GCR..."
    ):
        return False
    
    # Deploy backend
    if not run_command(
        f"""gcloud run deploy sports-injury-backend \\
            --image=gcr.io/{project_id}/sports-injury-backend:latest \\
            --platform=managed \\
            --region={region} \\
            --allow-unauthenticated \\
            --memory=2Gi \\
            --cpu=1""",
        "Deploying backend service..."
    ):
        return False
    
    # Get backend URL
    backend_url = subprocess.run(
        f"gcloud run services describe sports-injury-backend --platform=managed --region={region} --format='value(status.url)'",
        shell=True, capture_output=True, text=True
    ).stdout.strip()
    
    # Deploy frontend
    if not run_command(
        f"""gcloud run deploy sports-injury-frontend \\
            --image=gcr.io/{project_id}/sports-injury-frontend:latest \\
            --platform=managed \\
            --region={region} \\
            --allow-unauthenticated \\
            --memory=512Mi \\
            --cpu=1 \\
            --set-env-vars="BACKEND_URL={backend_url}" """,
        "Deploying frontend service..."
    ):
        return False
    
    # Get frontend URL
    frontend_url = subprocess.run(
        f"gcloud run services describe sports-injury-frontend --platform=managed --region={region} --format='value(status.url)'",
        shell=True, capture_output=True, text=True
    ).stdout.strip()
    
    print("\n" + "="*60)
    print("✓ Deployment Complete!")
    print("="*60)
    print(f"\nFrontend: {frontend_url}")
    print(f"Backend: {backend_url}")
    print(f"API Docs: {backend_url}/docs")
    
    return True

def deploy_local():
    """Deploy using docker-compose locally or to a VPS"""
    print("\n" + "="*60)
    print("Preparing for VPS deployment...")
    print("="*60)
    
    # Build images
    if not build_images():
        return False
    
    # Show deployment instructions
    print("\n" + "="*60)
    print("Next steps for VPS deployment:")
    print("="*60)
    print("""
1. Transfer images to server:
   docker save sports-injury-backend:latest -o backend.tar
   docker save sports-injury-frontend:latest -o frontend.tar
   scp *.tar user@your-server.com:/home/user/
   
2. On the server, load and run images:
   docker load -i backend.tar
   docker load -i frontend.tar
   docker-compose -f docker-compose.production.yml up -d

3. Access your application:
   http://your-server-ip:80
   API: http://your-server-ip:8000
    """)
    return True

def verify_deployment():
    """Verify deployment is working"""
    print("\n" + "="*60)
    print("Verification instructions:")
    print("="*60)
    print("""
1. Test frontend accessibility:
   curl -I https://your-frontend-url/

2. Test backend API:
   curl https://your-backend-url/health

3. Test login:
   curl -X POST https://your-backend-url/api/v1/auth/login \\
     -H "Content-Type: application/json" \\
     -d '{"email": "athlete@example.com", "password": "password"}'

4. Open frontend in browser and test login workflow
    """)

def main():
    print("\n" + "="*60)
    print("Sports Injury Risk Detection - Cloud Deployment")
    print("="*60)
    
    if not check_prerequisites():
        sys.exit(1)
    
    # Determine deployment method
    if len(sys.argv) > 1:
        method = sys.argv[1]
    else:
        print("\nChoose deployment method:")
        print("  1. gcloud  - Google Cloud Run (recommended)")
        print("  2. local   - Local/VPS deployment")
        print("  3. verify  - Verification only")
        method = input("\nEnter choice (1-3): ").strip()
        
        if method == '1':
            method = 'gcloud'
        elif method == '2':
            method = 'local'
        elif method == '3':
            method = 'verify'
        else:
            print("❌ Invalid choice")
            sys.exit(1)
    
    if method == 'gcloud':
        success = build_images() and deploy_gcloud()
    elif method == 'local':
        success = deploy_local()
    elif method == 'verify':
        verify_deployment()
        success = True
    else:
        print(f"❌ Unknown method: {method}")
        success = False
    
    if success:
        print("\n✓ Done!")
        sys.exit(0)
    else:
        print("\n❌ Deployment failed")
        sys.exit(1)

if __name__ == '__main__':
    main()

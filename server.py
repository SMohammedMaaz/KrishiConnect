#!/usr/bin/env python3
"""
A simple server script that helps run Django properly on Replit.
This script ensures that the server binds to the correct host and port,
and handles any necessary environment setup before starting the Django server.
"""
import os
import sys
import subprocess
import time

def main():
    """Run the Django development server with the correct settings for Replit."""
    print("Starting Django server for Replit environment...")
    
    # Make sure we're binding to 0.0.0.0 on port 5000 (required for Replit)
    host = "0.0.0.0"
    port = 5000
    
    # Collect static files to ensure they're properly served
    print("Collecting static files...")
    subprocess.run(["python", "manage.py", "collectstatic", "--noinput"], check=True)
    
    # Run initial database migrations if needed
    print("Applying database migrations...")
    subprocess.run(["python", "manage.py", "migrate", "--noinput"], check=True)
    
    # Run the Django server
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'krishiconnect.settings')
    
    # Set additional environment variables to help Django run correctly on Replit
    os.environ.setdefault('REPLIT_ENV', 'True')
    
    # Get the Replit info for better debugging
    repl_id = os.environ.get('REPL_ID', 'unknown')
    repl_slug = os.environ.get('REPL_SLUG', 'unknown')
    repl_owner = os.environ.get('REPL_OWNER', 'unknown')
    
    # Print some useful information
    print(f"Server is running at: http://{host}:{port}/")
    print(f"Replit info: ID={repl_id}, Slug={repl_slug}, Owner={repl_owner}")
    print("For Replit, access the app using the webview or the 'Open in a new tab' button.")
    
    # Run the Django server with the correct host and port
    try:
        subprocess.run([
            "python", "manage.py", "runserver",
            f"{host}:{port}",
            "--noreload"  # Disable auto-reload to prevent issues with Replit
        ], check=True)
    except KeyboardInterrupt:
        print("\nShutting down the server...")
    except Exception as e:
        print(f"Error starting the server: {e}")
        
        # Try alternative approach with a simple HTTP server as a fallback
        import http.server
        import socketserver
        
        print("Attempting to start a simple HTTP server as fallback...")
        os.chdir(os.path.join(os.path.dirname(__file__), 'static'))
        
        handler = http.server.SimpleHTTPRequestHandler
        with socketserver.TCPServer((host, port), handler) as httpd:
            print(f"Serving at http://{host}:{port}/")
            httpd.serve_forever()

if __name__ == "__main__":
    sys.exit(main())
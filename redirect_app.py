#!/usr/bin/env python3
"""
A simple Flask app that redirects users to the Django application.
This is used as a fallback in case the Django server is not accessible directly.
"""
import os
from flask import Flask, render_template, redirect, send_from_directory

app = Flask(__name__)

@app.route('/')
def index():
    """Serve the index.html page"""
    return send_from_directory('.', 'index.html')

@app.route('/health/')
def health():
    """Health check endpoint"""
    return "OK", 200

@app.route('/redirect/')
def redirect_to_app():
    """Redirect to the Django app"""
    repl_id = os.environ.get('REPL_ID', 'c65793e6-4c6d-47e9-8fee-254b0a427915')
    return redirect(f"https://{repl_id}.id.repl.co", code=302)

@app.route('/<path:path>')
def catch_all(path):
    """Catch-all route that serves static files or redirects to the Django app"""
    if os.path.exists(os.path.join('static', path)):
        return send_from_directory('static', path)
    return redirect(f"/{path}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
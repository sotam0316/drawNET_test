import os
from flask import Blueprint, render_template, send_from_directory

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/studio')
def studio():
    return render_template('studio.html')

@main_bp.route('/manual/<path:filename>')
def serve_manual(filename):
    return send_from_directory(os.path.join(os.getcwd(), 'manual'), filename)

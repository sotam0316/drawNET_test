from flask import Flask
from routes.main_routes import main_bp
from routes.api_routes import api_bp

def create_app():
    app = Flask(__name__)
    
    # Register Blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # 로컬 실행 최적화
    print("------------------------------------------")
    print("drawNET Premium Server Starting...")
    print("URL: http://127.0.0.1:5000")
    print("------------------------------------------")
    
    app.run(debug=True, port=5000)

import os
import logging
import sys
from flask import Flask
from jinja2 import ChoiceLoader, FileSystemLoader
from routes.main_routes import main_bp
from routes.api_routes import api_bp

# 로그 출력 설정 (컨테이너 로그에서 실시간 확인용)
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

def create_app():
    app = Flask(__name__)
    
    # 템플릿 로더 설정 유지
    app.jinja_loader = ChoiceLoader([
        FileSystemLoader(os.path.join(app.root_path, 'templates')),
        FileSystemLoader(os.path.join(app.root_path, 'tools'))
    ])
    
    # Blueprints 등록
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    
    # 진단 로그
    try:
        import routes.api_routes as ar
        import logic.license_manager as lm
        print(f"[*] API Routes Loaded From: {ar.__file__}")
        print(f"[*] License Manager Loaded From: {lm.__file__}")
    except Exception as e:
        print(f"[!] Error during diagnostic: {e}")
    
    return app

try:
    from routes import api_routes
    print("[*] API 모듈 로드 성공!")
except ImportError as e:
    print(f"[!] API 모듈 로드 실패: {e}")
except Exception as e:
    print(f"[!] 기타 에러: {e}")

if __name__ == '__main__':
    app = create_app()
    
    print("------------------------------------------")
    print("drawNET Premium Server Starting...")
    # 실제 접속 주소 로그 출력 수정
    print("Binding to: http://0.0.0.0:5000")
    print("------------------------------------------")
    
    # host='0.0.0.0' 추가가 핵심입니다.
    # LXC 환경에서는 use_reloader=False를 권장합니다.
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)

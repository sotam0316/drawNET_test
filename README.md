구동조건이 
윈도우(64bit)는 python 3.12 환경이 필요하고, 리눅스(amd64)는 python3.10 환경이 필요
drawNET\routes 에 있는 api_routes.cp312-win_amd64.pyd(윈도우64bit), api_routes.cpython-310-x86_64-linux-gnu.so(리눅스amd64)

윈도우(64bit)에 설치

0. cmd 실행
1. mkdir c:\My_Projects\drawNET
2. cd c:\My_Projects\drawNET
3. py -3.12 -m venv .venv
4. .venv\Scripts\activate
5. git clone https://github.com/sotam0316/drawNET_test
6. cd drawNET_test
7. pip install -r requirements.txt
8. python app.py
9. 127.0.0.1:5000 접속

이곳은 https://github.com/leeyj/drawNET (원개발자) 코드를 테스트 목적으로만 사용하는 곳입니다.

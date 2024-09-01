from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import random
from cryptography.hazmat.primitives.asymmetric import dh
from cryptography.hazmat.backends import default_backend

class RequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        shared_key = data['shared_key']

        p = int("E4911D9B70F5E67B331530F6A0E4C767BEB496022333432ED4D27BA8A77D5D63", 16)
        with open('/home/burdock/ICEA/did/DIDWEB-Chatbot/chatbotprikey.txt', 'r') as file:
            AI_key = file.read().strip()

        random_seed = random.SystemRandom().randint(1, p-1)
        with open('random.txt', 'w') as f:
            f.write(str(random_seed))

        AI_secret = get_suitable_secret_from_hex_key(AI_key, p) + random_seed
        Session_key = pow(int(shared_key), AI_secret, p)

        file_path = 'session_key.txt'
        with open(file_path, 'w') as file:
            file.write(str(Session_key))
            print(f"Session Key saved to {file_path}")
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"Shared Key received and Session Key saved")

def get_suitable_secret_from_hex_key(hex_key, p):
    key_decimal = int(hex_key, 16)
    return suitable_secret_from_key(key_decimal, p)

def suitable_secret_from_key(key_decimal, p):
    max_secret = 0
    length = len(str(key_decimal))
    
    for i in range(length):
        current_secret = key_decimal % (10 ** (i + 1))
        if current_secret < (p - 1) and current_secret > max_secret:
            max_secret = current_secret
    return max_secret

if __name__ == '__main__':
    server_address = ('localhost', 8000)
    httpd = HTTPServer(server_address, RequestHandler)
    print("Server running on port 8000...")
    httpd.serve_forever()


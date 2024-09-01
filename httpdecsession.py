from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import urllib.parse

class RequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        parsed_data = urllib.parse.parse_qs(post_data)
        encrypted_hex = parsed_data['encrypted_data'][0]

        decrypted_data, status = self.decrypt_data(encrypted_hex)
        
        self.send_response(status)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        if status == 200:
            self.wfile.write(b"Authentication successful")
        else:
            self.wfile.write(b"Authentication failed")

    def decrypt_data(self, encrypted_hex):
        with open('session_key.txt', 'r') as file:
            key_long = file.read().strip()
        
        key = hashlib.sha256(key_long.encode()).digest()
        
        iv = b'\x00' * 16
        
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        encrypted_data = bytes.fromhex(encrypted_hex)
        
        decrypted_padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
        
        unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
        decrypted_data = unpadder.update(decrypted_padded_data) + unpadder.finalize()
        
        with open('clipublicValue.txt', 'r') as file:
            clipublicValue = file.read().strip()
        
        if decrypted_data.hex() == clipublicValue:
            return decrypted_data, 200
        else:
            return None, 401

if __name__ == '__main__':
    server_address = ('localhost', 8000)
    httpd = HTTPServer(server_address, RequestHandler)
    print("Server running on port 8000...")
    httpd.serve_forever()

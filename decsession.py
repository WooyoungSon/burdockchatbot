#decsession.py

import hashlib
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend

with open('session_key.txt', 'r') as file:
    key_long = file.read().strip()

key = hashlib.sha256(key_long.encode()).digest()

iv = b'\x00' * 16 # 고정값 사용

cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
decryptor = cipher.decryptor()

with open('encmes.txt', 'r') as file:
    encrypted_hex = file.read().strip()
    encrypted_data = bytes.fromhex(encrypted_hex)

unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()

decrypted_padded_data = decryptor.update(encrypted_data) + decryptor.finalize()

decrypted_data = unpadder.update(decrypted_padded_data) + unpadder.finalize()

print("Decrypted message:", decrypted_data.hex())

with open('clipublicValue.txt', 'r') as file:
    clipublicValue = file.read().strip()
    
if decrypted_data.hex()==clipublicValue:
    status=200
    print(status)
    
else:
    status=-1
    print("An unauthenticated user was detected.")
	

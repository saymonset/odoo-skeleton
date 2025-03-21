import hashlib
import os
import base64

def generate_pbkdf2_key(password, salt=None, iterations=600000):
    # Generar un nuevo salt si no se proporciona uno
    if salt is None:
        salt = os.urandom(16)  # 16 bytes de salt aleatorio

    # Derivar la clave usando PBKDF2
    key = hashlib.pbkdf2_hmac(
        'sha512',  # Algoritmo de hash
        password.encode('utf-8'),  # Contraseña
        salt,  # Salt
        iterations  # Número de iteraciones
    )

    # Codificar el salt y la clave en base64 para almacenarlos
    salt_b64 = base64.b64encode(salt).decode('utf-8')
    key_b64 = base64.b64encode(key).decode('utf-8')

    return f"$pbkdf2-sha512${iterations}${salt_b64}${key_b64}"

# Ejemplo de uso
if __name__ == "__main__":
    password = input("Introduce la contraseña: ")
    hashed_key = generate_pbkdf2_key(password)
    print("Hash generado:", hashed_key)
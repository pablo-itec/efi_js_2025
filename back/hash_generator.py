# hash_generator.py (Código para ejecutar en tu entorno virtual Python)

from bcrypt import hashpw, gensalt # Importación directa desde la librería bcrypt

NEW_PASSWORDS = [
    "lautaropass", "mariapass", "sofiapass", "nicolaspass", "matiaspass", 
    "santiago123", "laura123", "paula123", 
    "franciscopass1", "tomaspass2"
]

print("\n--- Hashes Generados ---")
hashes = []
for p in NEW_PASSWORDS:
    # Codificar la contraseña y generar el hash usando gensalt()
    hashed_password = hashpw(p.encode('utf-8'), gensalt()).decode('utf-8')
    hashes.append(hashed_password)
    print(f"Contraseña: {p} -> Hash: {hashed_password}")
print("------------------------\n")

# ¡Debes COPIAR esta lista de hashes generados!
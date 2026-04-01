import bcrypt

# Match the settings in your main.py
# Replace these with the actual passwords you want for the team
passwords = {
    "HASH_ROOT": "rootprolaunch2026",
    "HASH_SALES": "salesprolaunch2026",
    "HASH_OPS": "opsprolaunch2026",
}

for var_name, password in passwords.items():
    byte_pwd = password.encode('utf-8')  # Convert to bytes for hashing
    pwd_hash = bcrypt.hashpw(byte_pwd, bcrypt.gensalt())

    print(f"{var_name}={pwd_hash.decode('utf-8')}")  # Print in a format suitable for .env files

from datetime import timedelta

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
)


def main():
    print("=== Password Hash Test ===")
    password = "test123"

    hashed = get_password_hash(password)
    print("Hashed password:", hashed)

    print("Verify correct:", verify_password("test123", hashed))
    print("Verify wrong:", verify_password("wrong", hashed))

    print("\n=== Token Test ===")
    token = create_access_token("user-1", expires_delta=timedelta(minutes=5))
    print("Token:", token)

    decoded = decode_access_token(token)
    print("Decoded token:", decoded)


if __name__ == "__main__":
    main()

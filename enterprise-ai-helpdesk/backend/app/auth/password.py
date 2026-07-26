import logging
from passlib.context import CryptContext

logger = logging.getLogger("app.auth.password")

# Configure passlib to use bcrypt exclusively with a secure default round count
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class PasswordHasher:
    """
    Handles cryptographic hashing and verification of security passwords
    to ensure plain-text values never hit the application storage layer.
    """

    @classmethod
    def hash_password(cls, password: str) -> str:
        """
        Generates a secure, salted bcrypt hash from a plain-text password.
        """
        return pwd_context.hash(password)

    @classmethod
    def verify_password(cls, plain_password: str, hashed_password: str) -> bool:
        """
        Verifies a candidate plain-text password against a stored secure hash.
        Returns True if the credentials match, otherwise False.
        """
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            logger.error(f"Error encountered during password verification sequence: {str(e)}")
            return False
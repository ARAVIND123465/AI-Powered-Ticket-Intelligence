import re
import html
import logging

logger = logging.getLogger("app.core.security")

class SecurityUtils:
    """
    Centralized sanitization interface to safeguard application input pipelines
    from text injection vectors and unwanted malicious payloads.
    """

    @classmethod
    def sanitize_input_text(cls, raw_text: str) -> str:
        """
        Cleans string structures to remove structural HTML elements, script tags, 
        and normalizes whitespaces safely before processing downstream.
        """
        if not raw_text:
            return ""

        # Step 1: Decode standard HTML entities to uniform text maps
        decoded_text = html.unescape(raw_text)

        # Step 2: Strip HTML tags entirely using a robust regex match pattern
        clean_text = re.sub(r"<[^>]*>", "", decoded_text)

        # Step 3: Remove leading/trailing whitespaces and squash redundant space arrays
        clean_text = " ".join(clean_text.split())

        if clean_text != raw_text:
            logger.debug("Input string was automatically sanitized to meet runtime security profiles.")

        return clean_text
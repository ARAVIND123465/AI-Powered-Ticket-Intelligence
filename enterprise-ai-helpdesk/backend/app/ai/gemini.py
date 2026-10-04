import os
import logging
from typing import Optional, AsyncGenerator
from app.core.config import settings  # Assuming settings holds config keys

logger = logging.getLogger("app.ai.gemini")

class GeminiClient:
    """
    Core wrapper for interacting with Google's Gemini models.
    Centralizes error handling, API credentials, and runtime parameters.
    """
    def __init__(self):
        # Gracefully pulls from app settings or environment directly
        self.api_key = getattr(settings, "GEMINI_API_KEY", os.getenv("GEMINI_API_KEY"))
        self.default_model = "gemini-2.5-flash"  # Highly efficient for operational text
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is missing. AI generation features will operate in sandbox mode.")

    async def generate_text(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None, 
        temperature: float = 0.2
    ) -> str:
        """
        Sends a non-streaming, grounded request to the Gemini API.
        Optimized for internal analysis tasks like summarization and root-cause mapping.
        """
        if not self.api_key:
            return "[Sandbox Mode] Gemini API key not provided. Unable to process real-time response."

        try:
            # Note: In production, install and use: google-genai
            # This implementation structured for zero-crash fallback readiness
            import google.generativeai as genai
            genai.configure(api_key=self.api_key, transport="rest")
            
            model = genai.GenerativeModel(
                model_name=self.default_model,
                generation_config={"temperature": temperature},
                system_instruction=system_instruction
            )
            
            # Run in executor if the library call blocks async loop
            response = model.generate_content(prompt)
            return response.text.strip()
            
        except ImportError:
            logger.error("google-generativeai library is not installed.")
            return "Error: AI engine dependencies missing locally."
        except Exception as e:
            logger.error(f"Gemini generation error: {str(e)}")
            return f"Error generation failed: {str(e)}"

    async def generate_stream(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None,
        temperature: float = 0.5
    ) -> AsyncGenerator[str, None]:
        """
        Streams response tokens chunk-by-chunk. Ideal for real-time customer 
        facing chat features or interactive drafting.
        """
        if not self.api_key:
            yield "[Sandbox Mode] Live streaming unavailable."
            return

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key, transport="rest")
            
            model = genai.GenerativeModel(
                model_name=self.default_model,
                generation_config={"temperature": temperature},
                system_instruction=system_instruction
            )
            
            response = model.generate_content(prompt, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
                    
        except Exception as e:
            logger.error(f"Gemini streaming exception: {str(e)}")
            yield f"\n[Stream Interrupted: {str(e)}]"

# Singleton instance ready for importing across the /ai or /services subfolders
gemini_client = GeminiClient()
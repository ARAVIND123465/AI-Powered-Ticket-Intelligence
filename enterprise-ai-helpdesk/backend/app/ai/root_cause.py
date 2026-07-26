import logging
import json
from typing import Dict, Any
from app.ai.gemini import gemini_client

logger = logging.getLogger("app.ai.root_cause")

class RootCauseAnalyzer:
    """
    Leverages Gemini to dissect technical/operational data and isolate 
    the core root cause behind a customer's support ticket.
    """
    
    SYSTEM_INSTRUCTION = (
        "You are an expert Enterprise Systems Diagnostics Agent. Your job is to analyze "
        "incoming technical support tickets and determine the foundational root cause. "
        "You must output your findings ONLY in valid JSON format with the keys: "
        "'primary_issue', 'category', 'technical_depth', and 'recommended_logs_to_check'."
    )

    @classmethod
    async def analyze_ticket(cls, ticket_title: str, ticket_description: str) -> Dict[str, Any]:
        """
        Parses ticket content and extracts structural insights regarding the root failure point.
        """
        prompt = f"""
        Analyze the following technical ticket and isolate what failed.
        
        Ticket Title: {ticket_title}
        Ticket Description: {ticket_description}
        
        Provide the output in JSON format with structural information.
        """
        
        try:
            raw_response = await gemini_client.generate_text(
                prompt=prompt,
                system_instruction=cls.SYSTEM_INSTRUCTION,
                temperature=0.1  # Low temperature for highly deterministic analytical output
            )
            
            # Clean up potential markdown blocks if returned by the LLM
            cleaned_json = raw_response.strip("`").replace("json\n", "").strip()
            return json.loads(cleaned_json)
            
        except json.JSONDecodeError:
            logger.error("Failed to parse Gemini root-cause output as valid JSON.")
            return {
                "primary_issue": "Failed to parse systemic details automatically.",
                "category": "Unknown / Unstructured Technical Issue",
                "technical_depth": "High",
                "recommended_logs_to_check": ["application.log", "database.err"]
            }
        except Exception as e:
            logger.error(f"Error in root cause analysis module: {str(e)}")
            return {"error": f"Diagnostic run failed: {str(e)}"}
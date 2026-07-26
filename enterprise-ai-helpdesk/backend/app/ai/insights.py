import logging
import json
from typing import List, Dict, Any
from app.ai.gemini import gemini_client

logger = logging.getLogger("app.ai.insights")

class SupportInsightsGenerator:
    """
    Analyzes aggregated ticket logs to extract deep, systemic operational 
    insights and product improvement opportunities.
    """
    
    SYSTEM_INSTRUCTION = (
        "You are a Senior Operational Excellence & Data Analyst. Your job is to parse "
        "batches of customer support tickets and extract high-level patterns. "
        "You must output your analysis ONLY as a valid JSON object with the following structure:\n"
        "{\n"
        "  \"top_pain_points\": [\"point 1\", \"point 2\"],\n"
        "  \"systemic_bottlenecks\": \"Summary of architectural or process delays\",\n"
        "  \"recommended_kb_additions\": [\"Topic Title A\", \"Topic Title B\"]\n"
        "}"
    )

    @classmethod
    async def generate_batch_insights(cls, tickets: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Parses a list of structured ticket metadata records and textual descriptions 
        to isolate overarching operational patterns.
        """
        if not tickets:
            return {
                "top_pain_points": [],
                "systemic_bottlenecks": "No ticket data provided for analysis.",
                "recommended_kb_additions": []
            }

        # Format input ticket data into a compact payload for the prompt
        formatted_batch = []
        for idx, t in enumerate(tickets):
            formatted_batch.append(
                f"Ticket #{idx+1} | Category: {t.get('category', 'N/A')} | "
                f"Priority: {t.get('priority', 'N/A')} | "
                f"Content: {t.get('title', '')} - {t.get('description', '')}"
            )
        
        tickets_payload = "\n".join(formatted_batch)

        prompt = f"""
        Analyze this batch of customer support tickets to identify trends, bugs, and documentation gaps:
        
        {tickets_payload}
        
        Provide the strategic synthesis in the requested JSON layout.
        """
        
        try:
            raw_response = await gemini_client.generate_text(
                prompt=prompt,
                system_instruction=cls.SYSTEM_INSTRUCTION,
                temperature=0.2  # Moderately low to ensure data integrity over large blocks
            )
            
            # Clean possible markdown wrapping blocks securely
            cleaned_json = raw_response.strip("`").replace("json\n", "").strip()
            return json.loads(cleaned_json)
            
        except json.JSONDecodeError:
            logger.error("Failed to parse operational insights as valid JSON.")
            return {
                "top_pain_points": ["Could not parse trends uniformly."],
                "systemic_bottlenecks": "Error extracting cluster patterns.",
                "recommended_kb_additions": ["Review incoming ticket logs manually."]
            }
        except Exception as e:
            logger.error(f"Error executing insights module: {str(e)}")
            return {"error": f"Insights computation failed: {str(e)}"}
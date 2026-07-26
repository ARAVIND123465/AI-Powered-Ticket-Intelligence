import logging
from typing import List, Dict
from app.ai.gemini import gemini_client

logger = logging.getLogger("app.ai.summarizer")

class TicketSummarizer:
    """
    Condenses complex multi-turn ticket threads into rapid structural 
    summaries for agents during escalation and review loops.
    """
    
    SYSTEM_INSTRUCTION = (
        "You are an executive assistant integrated into a high-scale corporate helpdesk. "
        "Your task is to review ticket dialogue transcripts and provide a clear, condensed snapshot. "
        "Highlight exactly: 1. Core Problem, 2. Steps Taken So Far, and 3. The Current Blocker. "
        "Be extremely brief and objective."
    )

    @classmethod
    async def summarize_thread(cls, messages: List[Dict[str, str]]) -> str:
        """
        Parses a list of message dicts (e.g., [{'sender': 'user', 'text': '...'}]) 
        and generates a high-level operational summary.
        """
        if not messages:
            return "No text thread historical context available to summarize."
            
        # Format the thread dynamically for processing context
        formatted_thread = ""
        for idx, msg in enumerate(messages):
            sender = msg.get("sender", "Unknown").upper()
            text = msg.get("text", "")
            formatted_thread += f"[{idx + 1}] {sender}: {text}\n"

        prompt = f"""
        Please summarize the following active support interaction thread:
        
        --- Thread Start ---
        {formatted_thread}
        --- Thread End ---
        
        Generate the executive operational snapshot.
        """
        
        try:
            summary = await gemini_client.generate_text(
                prompt=prompt,
                system_instruction=cls.SYSTEM_INSTRUCTION,
                temperature=0.1  # Highly deterministic to focus only on concrete conversation items
            )
            return summary
            
        except Exception as e:
            logger.error(f"Error executing thread summarizer module: {str(e)}")
            return "Failed to synthesize ticket conversation history automatically."
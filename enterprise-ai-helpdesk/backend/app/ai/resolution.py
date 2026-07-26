import logging
from typing import List, Optional
from app.ai.gemini import gemini_client

logger = logging.getLogger("app.ai.resolution")

class ResolutionGenerator:
    """
    Formulates professional, accurate resolution steps or customer replies
    by utilizing incoming ticket data and validating against pulled KB context.
    """
    
    SYSTEM_INSTRUCTION = (
        "You are an expert IT Helpdesk Resolver Agent. Your job is to draft a clear, "
        "step-by-step resolution or troubleshooting guide for the user based on their ticket. "
        "Keep your tone empathetic, technical, and objective. Use bullet points for steps."
    )

    @classmethod
    async def generate_draft(
        cls, 
        ticket_title: str, 
        ticket_description: str, 
        context_chunks: Optional[List[str]] = None
    ) -> str:
        """
        Drafts a resolution plan. If context_chunks are provided from the vector store, 
        they are injected to ground the model's factual accuracy.
        """
        # Format the reference context block if it exists
        context_str = ""
        if context_chunks:
            context_str = "\n".join([f"- {chunk}" for chunk in context_chunks])
        else:
            context_str = "No specific reference documents found. Use internal standard IT best practices."

        prompt = f"""
        Draft a resolution guide for the following ticket:
        
        Ticket Title: {ticket_title}
        Description: {ticket_description}
        
        Reference Material (Knowledge Base):
        {context_str}
        
        Provide a clean, comprehensive response addressing the issue directly.
        """
        
        try:
            draft = await gemini_client.generate_text(
                prompt=prompt,
                system_instruction=cls.SYSTEM_INSTRUCTION,
                temperature=0.3  # Slight creativity allowed for wording structural phrasing
            )
            return draft
            
        except Exception as e:
            logger.error(f"Error generating automated resolution plan: {str(e)}")
            return "Unable to generate draft resolution automatically at this time."
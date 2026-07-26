"""
backend/app/rag/chatbot.py

Module 4 of the rag/ folder — RAG chatbot for the AI knowledge-base chat.

Responsibilities:
    - Take a user message (+ optional conversation history) and produce a
      grounded answer using retriever.py's context chunks
    - Assemble a prompt that (a) forces the model to stick to retrieved
      context, (b) makes it say "I don't know" instead of hallucinating when
      nothing relevant was retrieved, and (c) returns citations the frontend
      can render as clickable source links
    - Call the LLM (Claude by default, OpenAI-compatible as a fallback),
      with streaming support for a responsive chat UI
    - Keep conversation history so follow-up questions ("what about for
      annual plans?") retrieve and answer with the right context

Usage:
    from app.rag.chatbot import KBChatbot

    bot = KBChatbot()
    reply = bot.ask("How do I get a refund on an annual plan?")
    print(reply.answer)
    print(reply.citations)

    # streaming (e.g. for a chat UI / websocket)
    for token in bot.ask_stream("what about monthly plans?", history=reply.history):
        send_to_client(token)
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from typing import Generator, List, Optional

from app.rag.retriever import Retriever, RetrievalResult

logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #

@dataclass
class ChatbotConfig:
    provider: str = field(
        default_factory=lambda: os.getenv("RAG_LLM_PROVIDER", "anthropic")
    )
    anthropic_model: str = field(
        default_factory=lambda: os.getenv("RAG_ANTHROPIC_MODEL", "claude-sonnet-4-6")
    )
    openai_model: str = field(
        default_factory=lambda: os.getenv("RAG_OPENAI_MODEL", "gpt-4o-mini")
    )
    max_tokens: int = 800
    temperature: float = 0.2  # low temp — this is a support/factual assistant
    top_k_chunks: int = 5
    max_history_turns: int = 6  # trailing user/assistant pairs kept for context
    no_context_message: str = (
        "I couldn't find anything in the knowledge base about that. "
        "It might be worth escalating this to a human agent."
    )


SYSTEM_PROMPT_TEMPLATE = """You are a customer support assistant answering questions using ONLY the knowledge-base context provided below.

Rules:
- Answer using only the CONTEXT section. Do not use outside knowledge.
- If the context does not contain enough information to answer confidently, say so plainly and suggest escalating to a human agent. Do not guess.
- Keep answers concise and directly actionable for a support agent or customer.
- When you use a fact from the context, reference it with its bracketed number, e.g. [1], matching the source list below.
- Never invent a source number that isn't in the context.

CONTEXT:
{context}
"""


# --------------------------------------------------------------------------- #
# Result types
# --------------------------------------------------------------------------- #

@dataclass
class ChatMessage:
    role: str  # "user" | "assistant"
    content: str


@dataclass
class Citation:
    index: int
    title: str
    url: str
    source: str
    doc_id: str


@dataclass
class ChatReply:
    answer: str
    citations: List[Citation]
    history: List[ChatMessage]
    used_context: bool  # False if we fell back to no_context_message


# --------------------------------------------------------------------------- #
# LLM backends
# --------------------------------------------------------------------------- #

class _AnthropicBackend:
    name = "anthropic"

    def __init__(self, config: ChatbotConfig):
        import anthropic  # lazy import

        self._client = anthropic.Anthropic()
        self._model = config.anthropic_model
        self._config = config

    def complete(self, system: str, messages: List[ChatMessage]) -> str:
        resp = self._client.messages.create(
            model=self._model,
            max_tokens=self._config.max_tokens,
            temperature=self._config.temperature,
            system=system,
            messages=[{"role": m.role, "content": m.content} for m in messages],
        )
        return "".join(
            block.text for block in resp.content if getattr(block, "type", "") == "text"
        )

    def stream(
        self, system: str, messages: List[ChatMessage]
    ) -> Generator[str, None, None]:
        with self._client.messages.stream(
            model=self._model,
            max_tokens=self._config.max_tokens,
            temperature=self._config.temperature,
            system=system,
            messages=[{"role": m.role, "content": m.content} for m in messages],
        ) as stream:
            for text in stream.text_stream:
                yield text


class _OpenAIBackend:
    name = "openai"

    def __init__(self, config: ChatbotConfig):
        from openai import OpenAI  # lazy import

        self._client = OpenAI()
        self._model = config.openai_model
        self._config = config

    def _to_messages(self, system: str, messages: List[ChatMessage]) -> list:
        out = [{"role": "system", "content": system}]
        out.extend({"role": m.role, "content": m.content} for m in messages)
        return out

    def complete(self, system: str, messages: List[ChatMessage]) -> str:
        resp = self._client.chat.completions.create(
            model=self._model,
            max_tokens=self._config.max_tokens,
            temperature=self._config.temperature,
            messages=self._to_messages(system, messages),
        )
        return resp.choices[0].message.content or ""

    def stream(
        self, system: str, messages: List[ChatMessage]
    ) -> Generator[str, None, None]:
        stream = self._client.chat.completions.create(
            model=self._model,
            max_tokens=self._config.max_tokens,
            temperature=self._config.temperature,
            messages=self._to_messages(system, messages),
            stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta


def _build_backend(config: ChatbotConfig):
    if config.provider == "anthropic":
        try:
            return _AnthropicBackend(config)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Anthropic backend unavailable (%s), trying OpenAI.", exc)
            return _OpenAIBackend(config)
    elif config.provider == "openai":
        return _OpenAIBackend(config)
    else:
        raise ValueError(f"Unknown RAG_LLM_PROVIDER: {config.provider}")


# --------------------------------------------------------------------------- #
# Chatbot
# --------------------------------------------------------------------------- #

class KBChatbot:
    def __init__(
        self,
        retriever: Optional[Retriever] = None,
        config: Optional[ChatbotConfig] = None,
    ):
        self.config = config or ChatbotConfig()
        self.retriever = retriever or Retriever()
        self._backend = _build_backend(self.config)

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #

    def ask(
        self,
        question: str,
        history: Optional[List[ChatMessage]] = None,
    ) -> ChatReply:
        system, citations, retrieval, trimmed_history = self._prepare(question, history)

        if retrieval.is_empty:
            answer = self.config.no_context_message
            new_history = trimmed_history + [
                ChatMessage(role="user", content=question),
                ChatMessage(role="assistant", content=answer),
            ]
            return ChatReply(
                answer=answer, citations=[], history=new_history, used_context=False
            )

        messages = trimmed_history + [ChatMessage(role="user", content=question)]
        answer = self._backend.complete(system, messages)

        new_history = messages + [ChatMessage(role="assistant", content=answer)]
        return ChatReply(
            answer=answer,
            citations=citations,
            history=self._trim_history(new_history),
            used_context=True,
        )

    def ask_stream(
        self,
        question: str,
        history: Optional[List[ChatMessage]] = None,
    ) -> Generator[str, None, None]:
        """
        Streaming variant for chat UIs / websockets. Yields text tokens as
        they arrive. Falls back to a single non-streamed chunk if nothing
        relevant was retrieved (no point streaming a canned message).
        """
        system, _citations, retrieval, trimmed_history = self._prepare(question, history)

        if retrieval.is_empty:
            yield self.config.no_context_message
            return

        messages = trimmed_history + [ChatMessage(role="user", content=question)]
        yield from self._backend.stream(system, messages)

    # ------------------------------------------------------------------ #
    # Internals
    # ------------------------------------------------------------------ #

    def _prepare(
        self, question: str, history: Optional[List[ChatMessage]]
    ):
        trimmed_history = self._trim_history(history or [])

        retrieval: RetrievalResult = self.retriever.retrieve(
            question, top_k=self.config.top_k_chunks
        )

        citations = [
            Citation(
                index=i + 1,
                title=chunk.title or chunk.doc_id,
                url=chunk.url,
                source=chunk.source,
                doc_id=chunk.doc_id,
            )
            for i, chunk in enumerate(retrieval.chunks)
        ]

        context_str = retrieval.to_context_string()
        system = SYSTEM_PROMPT_TEMPLATE.format(context=context_str or "(no context found)")

        return system, citations, retrieval, trimmed_history

    def _trim_history(self, history: List[ChatMessage]) -> List[ChatMessage]:
        max_messages = self.config.max_history_turns * 2  # user+assistant pairs
        if len(history) <= max_messages:
            return history
        return history[-max_messages:]


# --------------------------------------------------------------------------- #
# FastAPI wiring helper (used by api/kb_chat.py or similar router)
# --------------------------------------------------------------------------- #

_singleton_bot: Optional[KBChatbot] = None


def get_chatbot() -> KBChatbot:
    """
    Process-wide singleton so the FAISS index and retriever aren't
    reloaded per-request. Safe to call from a FastAPI dependency:

        @router.post("/kb-chat")
        def kb_chat(payload: ChatRequest, bot: KBChatbot = Depends(get_chatbot)):
            reply = bot.ask(payload.message, history=payload.history)
            return {"answer": reply.answer, "citations": reply.citations}
    """
    global _singleton_bot
    if _singleton_bot is None:
        _singleton_bot = KBChatbot()
    return _singleton_bot
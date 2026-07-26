import os
import json
import logging
import numpy as np
from typing import List, Dict, Any, Optional
from app.rag.embeddings import get_embedding_model

logger = logging.getLogger("app.rag.index")

# High-fidelity mock knowledge base articles
DEFAULT_MOCK_ARTICLES = [
    {
        "chunk_id": "kb_1",
        "doc_id": "vpn_issues",
        "title": "VPN connection drops every 30 minutes",
        "url": "/kb/vpn-connection-drops",
        "source": "kb",
        "text": "If your corporate VPN connection disconnects automatically every 30 minutes, it is likely due to the security group re-authentication lease limit. Check your active session token in the identity provider. Restarting the client or clearing local profile cache solves most drops."
    },
    {
        "chunk_id": "kb_2",
        "doc_id": "refund_errors",
        "title": "Cannot process refund for order",
        "url": "/kb/cannot-process-refund",
        "source": "kb",
        "text": "Refund processing failures usually happen when the transaction gateway response code is 402 or the invoice reference number is malformed. Verify invoice syntax (starts with INV-) and check if payment gateway account balance is sufficient."
    },
    {
        "chunk_id": "kb_3",
        "doc_id": "sso_forbidden",
        "title": "SSO login returning 403 forbidden",
        "url": "/kb/sso-login-forbidden",
        "source": "kb",
        "text": "Active Directory Federation Services (ADFS) or Okta SSO login returning HTTP status code 403 Forbidden indicates that the corporate user group role mapping does not align with helpdesk permissions. Contact AD Admin to verify group policy memberships."
    },
    {
        "chunk_id": "kb_4",
        "doc_id": "safari_rendering",
        "title": "Dashboard charts not loading on Safari",
        "url": "/kb/dashboard-safari-issue",
        "source": "kb",
        "text": "The Safari rendering engine blocks SVG layouts that exceed 8192px viewport bounds. Clear your browser history, check console logs for resource errors, and use Chrome or Firefox as a workaround if security controls permit."
    }
]

class KBIndex:
    """
    Manages vector representations, file persistence, and top-k search operations.
    Falls back gracefully to NumPy matrix similarity operations if FAISS is unavailable.
    """
    def __init__(self):
        self.embeddings_model = get_embedding_model()
        self.vector_db_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../vector_db"))
        self.index_path = os.path.join(self.vector_db_dir, "faiss.index")
        self.metadata_path = os.path.join(self.vector_db_dir, "metadata.json")
        self.embeddings_path = os.path.join(self.vector_db_dir, "embeddings.npy")
        
        self.chunks: List[Dict[str, Any]] = []
        self.index = None
        self.embeddings_matrix: Optional[np.ndarray] = None
        
        # Load index files and populate defaults if empty
        self._load_metadata()
        self._initialize_index()

    def _load_metadata(self):
        if os.path.exists(self.metadata_path) and os.path.getsize(self.metadata_path) > 0:
            try:
                with open(self.metadata_path, "r") as f:
                    self.chunks = json.load(f)
                logger.info(f"Loaded {len(self.chunks)} knowledge base chunks from metadata.")
            except Exception as e:
                logger.error(f"Error loading metadata: {e}")
                self.chunks = []
        else:
            self.chunks = []

    def _initialize_index(self):
        # Bootstrap default articles if the database is unpopulated
        if not self.chunks:
            logger.info("Vector database is unpopulated. Seeding default KB articles...")
            self._seed_default_articles()
            return

        # Try to load existing FAISS index
        try:
            import faiss
            if os.path.exists(self.index_path) and os.path.getsize(self.index_path) > 0:
                self.index = faiss.read_index(self.index_path)
                logger.info("Loaded FAISS index from disk.")
            else:
                self._rebuild_faiss_index()
        except ImportError:
            logger.warning("faiss-cpu is not installed. RAG retrieval will run in fallback NumPy mode.")
            self.index = None
            
        # Load NumPy embeddings file for fallback search
        if os.path.exists(self.embeddings_path) and os.path.getsize(self.embeddings_path) > 0:
            try:
                self.embeddings_matrix = np.load(self.embeddings_path)
            except Exception as e:
                logger.error(f"Failed to load numpy embeddings: {e}")

    def _seed_default_articles(self):
        try:
            self.chunks = DEFAULT_MOCK_ARTICLES
            # Write metadata.json
            os.makedirs(self.vector_db_dir, exist_ok=True)
            with open(self.metadata_path, "w") as f:
                json.dump(self.chunks, f, indent=2)
            
            # Generate embeddings
            texts = [c["text"] for c in self.chunks]
            embeddings = self.embeddings_model.embed_texts(texts)
            self.embeddings_matrix = np.array(embeddings, dtype=np.float32)
            
            # Save numpy file
            np.save(self.embeddings_path, self.embeddings_matrix)
            logger.info("Saved fallback numpy embeddings.")
            
            # Try to save FAISS file
            try:
                import faiss
                self.index = faiss.IndexFlatIP(self.embeddings_model.dim)
                self.index.add(self.embeddings_matrix)
                faiss.write_index(self.index, self.index_path)
                logger.info("Saved FAISS index database file.")
            except ImportError:
                self.index = None
        except Exception as e:
            logger.critical(f"Critical error seeding vector database: {e}", exc_info=True)

    def _rebuild_faiss_index(self):
        try:
            import faiss
            if os.path.exists(self.embeddings_path) and os.path.getsize(self.embeddings_path) > 0:
                self.embeddings_matrix = np.load(self.embeddings_path)
                self.index = faiss.IndexFlatIP(self.embeddings_model.dim)
                self.index.add(self.embeddings_matrix)
                faiss.write_index(self.index, self.index_path)
                logger.info("Rebuilt and saved FAISS index from embeddings file.")
        except Exception as e:
            logger.error(f"Failed to rebuild FAISS index: {e}")

    @classmethod
    def load_or_create(cls) -> "KBIndex":
        return cls()

    def search(self, query: str, k: int = 5, source_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Runs a cosine similarity search against index vectors, returning matches
        that optionally align with the source file type constraint.
        """
        if not self.chunks:
            return []

        try:
            query_vector = self.embeddings_model.embed_query(query)
            query_arr = np.array([query_vector], dtype=np.float32)
        except Exception as e:
            logger.error(f"Failed to generate query embeddings: {e}")
            return []

        # NumPy fallback / filter workflow
        # If filtering or FAISS isn't imported, calculate similarity using numpy matrix dot product
        if self.index is None or source_filter or self.embeddings_matrix is not None:
            try:
                if self.embeddings_matrix is None:
                    # Lazily compile embeddings from models on the fly
                    texts = [c["text"] for c in self.chunks]
                    embeddings = self.embeddings_model.embed_texts(texts)
                    self.embeddings_matrix = np.array(embeddings, dtype=np.float32)

                # Compute cosine similarities (inner product of normalized vectors)
                scores = np.dot(self.embeddings_matrix, query_arr[0])
                
                # Match chunks that align with source filters
                matches = []
                for i, score in enumerate(scores):
                    chunk = self.chunks[i]
                    if source_filter and chunk.get("source") != source_filter:
                        continue
                    matches.append((score, i))
                
                # Rank matches descending
                matches.sort(key=lambda x: x[0], reverse=True)
                top_matches = matches[:k]
                
                results = []
                for score, idx in top_matches:
                    chunk = self.chunks[idx]
                    results.append({
                        "chunk_id": chunk.get("chunk_id", str(idx)),
                        "doc_id": chunk.get("doc_id", "kb_doc"),
                        "title": chunk.get("title", "KB Article"),
                        "url": chunk.get("url", "#"),
                        "source": chunk.get("source", "kb"),
                        "text": chunk.get("text", ""),
                        "score": float(score)
                    })
                return results
            except Exception as e:
                logger.error(f"Fallback numpy matrix search failed: {e}", exc_info=True)

        # Standard FAISS index search
        if self.index is not None:
            try:
                distances, indices = self.index.search(query_arr, k)
                results = []
                for score, idx in zip(distances[0], indices[0]):
                    if idx < 0 or idx >= len(self.chunks):
                        continue
                    chunk = self.chunks[idx]
                    results.append({
                        "chunk_id": chunk.get("chunk_id", str(idx)),
                        "doc_id": chunk.get("doc_id", "kb_doc"),
                        "title": chunk.get("title", "KB Article"),
                        "url": chunk.get("url", "#"),
                        "source": chunk.get("source", "kb"),
                        "text": chunk.get("text", ""),
                        "score": float(score)
                    })
                return results
            except Exception as e:
                logger.error(f"FAISS vector search failed: {e}")

        return []

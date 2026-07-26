import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import your database bootstrap runner
from app.database.migrations import run_essential_migrations

# Import every API router built across the workspace suite
from app.api import auth, tickets, users, dashboard, analytics, chatbot, search, reports, notifications, screenshot

# Initialize centralized logging formats
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app.main")

app = FastAPI(
    title="Intelligent Enterprise AI Helpdesk",
    description="Intelligent Ticket Classification, Priority Routing, and RAG Knowledge Architecture Suite.",
    version="1.0.0"
)

# --- CORS Middleware Configuration ---
# Allows seamless development integrations between your Vite+TypeScript frontend and FastAPI
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Default Vite server port
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Server Lifecycle Triggers ---
@app.on_event("startup")
def on_startup_verification():
    """
    Executes automatically when the FastAPI server spins up. 
    Verifies database layout structures securely before listening for traffic.
    """
    logger.info("Server lifecycle boot initiated. Verifying data store configurations...")
    success = run_essential_migrations()
    if success:
        logger.info("Database validation sequence finalized. Ready to process traffic.")
    else:
        logger.critical("Server startup sequence interrupted due to database initialization failure.")

# --- API Router Integration Mount Points ---
app.include_router(auth.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(screenshot.router, prefix="/api")

@app.get("/")
def read_root_health_check():
    """
    Global baseline target route to perform load-balancer structural health diagnostics.
    """
    return {
        "status": "online",
        "service": "Enterprise AI Helpdesk Core API Gateway Engine",
        "timestamp": "synchronized"
    }
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.graph import router as graph_router
from app.api.traversal import router as traversal_router
from app.api.state import router as state_router

app = FastAPI(
    title="Hierarchical Graph Explorer",
    description="A generic hierarchical graph exploration engine with stateful traversal and conditional routing.",
    version="0.1.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(graph_router)
app.include_router(traversal_router)
app.include_router(state_router)


@app.get("/")
def root():
    return {
        "service": "Hierarchical Graph Explorer",
        "version": "0.1.0",
        "docs": "/docs",
    }

"""
FastAPI backend for portfolio contact form.
Run:  uvicorn main:app --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from database import engine, SessionLocal, Base, ContactMessage
from datetime import datetime

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Portfolio Contact API")

# CORS — allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ContactRequest(BaseModel):
    name: str
    email: str
    message: str


@app.get("/")
def root():
    return {"status": "ok", "message": "Portfolio API is running"}


@app.post("/contact")
def submit_contact(data: ContactRequest):
    """Receive a contact form submission and store it in SQLite."""
    if not data.name.strip() or not data.email.strip() or not data.message.strip():
        raise HTTPException(status_code=400, detail="All fields are required.")

    db = SessionLocal()
    try:
        entry = ContactMessage(
            name=data.name.strip(),
            email=data.email.strip(),
            message=data.message.strip(),
            created_at=datetime.utcnow().isoformat(),
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return {"status": "success", "id": entry.id}
    finally:
        db.close()


@app.get("/messages")
def list_messages():
    """List all stored contact messages (admin utility)."""
    db = SessionLocal()
    try:
        msgs = db.query(ContactMessage).order_by(ContactMessage.id.desc()).all()
        return [
            {"id": m.id, "name": m.name, "email": m.email,
             "message": m.message, "created_at": m.created_at}
            for m in msgs
        ]
    finally:
        db.close()

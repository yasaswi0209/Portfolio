"""
FastAPI backend for portfolio contact form.
Run: uvicorn main:app --reload
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import engine, SessionLocal, Base, ContactMessage
from datetime import datetime
import smtplib
from email.mime.text import MIMEText

# 🔥 CREATE TABLES
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Portfolio Contact API")

# 🔓 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📩 REQUEST MODEL
class ContactRequest(BaseModel):
    name: str
    email: str
    message: str


# 📧 EMAIL FUNCTION
def send_email(name, email, message):
  

    sender_email = os.getenv("EMAIL")
    sender_password = os.getenv("PASSWORD")
    receiver_email = os.getenv("EMAIL")

    subject = f"🚀 New Portfolio Message from {name}"

    body = f"""
You received a new message from your portfolio!

👤 Name: {name}
📧 Email: {email}

💬 Message:
{message}
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = receiver_email

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
    except Exception as e:
        print("Email sending failed:", e)


# 🏠 ROOT
@app.get("/")
def root():
    return {"status": "ok", "message": "Portfolio API is running 🚀"}


# 📩 CONTACT API (DB + EMAIL)
@app.post("/contact")
def submit_contact(data: ContactRequest):

    if not data.name.strip() or not data.email.strip() or not data.message.strip():
        raise HTTPException(status_code=400, detail="All fields are required.")

    db = SessionLocal()

    try:
        # 💾 SAVE TO DATABASE
        entry = ContactMessage(
            name=data.name.strip(),
            email=data.email.strip(),
            message=data.message.strip(),
            created_at=datetime.utcnow().isoformat(),
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)

        # 📧 SEND EMAIL
        send_email(entry.name, entry.email, entry.message)

        return {
            "status": "success",
            "message": "Message sent successfully 📩",
            "id": entry.id
        }

    finally:
        db.close()


# 📊 VIEW MESSAGES (OPTIONAL)
@app.get("/messages")
def list_messages():
    db = SessionLocal()
    try:
        msgs = db.query(ContactMessage).order_by(ContactMessage.id.desc()).all()
        return [
            {
                "id": m.id,
                "name": m.name,
                "email": m.email,
                "message": m.message,
                "created_at": m.created_at
            }
            for m in msgs
        ]
    finally:
        db.close()
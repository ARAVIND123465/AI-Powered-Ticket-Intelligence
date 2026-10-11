"""
test_attachments_workflow.py
-----------------------------
Direct verification of the PDF Upload, Storage, Listing, Download,
AI Analysis, and Analysis Retrieval routines in attachments.py.
"""

import io
import asyncio
from fastapi import UploadFile
from pypdf import PdfWriter

from app.database.database import SessionLocal
from app.database import models
from app.api.attachments import (
    upload_attachment,
    list_attachments,
    download_attachment,
    analyze_attachment,
    get_analyses,
)

def create_sample_pdf() -> bytes:
    """Generate a valid in-memory PDF."""
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    stream = io.BytesIO()
    writer.write(stream)
    return stream.getvalue()

async def run_direct_workflow_test():
    db = SessionLocal()
    try:
        # 1. Fetch or create test user (Agent)
        agent_user = db.query(models.User).filter(models.User.email == "test_agent_pdf@company.com").first()
        if not agent_user:
            agent_user = models.User(
                id="USR-TEST-AGENT-1",
                email="test_agent_pdf@company.com",
                hashed_password="hashedpassword123",
                role="Agent",
                full_name="Agent Sarah Connor",
            )
            db.add(agent_user)
            db.commit()
            db.refresh(agent_user)

        # 2. Fetch or create test ticket
        test_ticket = db.query(models.Ticket).filter(models.Ticket.id == "TKT-TEST-PDF-1").first()
        if not test_ticket:
            test_ticket = models.Ticket(
                id="TKT-TEST-PDF-1",
                title="Stripe payment deduction error with receipt",
                description="My payment failed with code ERR-9021 but my card was charged $49.00. Attached receipt.",
                user_id=agent_user.id,
                status="Open",
                category="Payment",
                priority="High",
                sentiment="Frustrated",
            )
            db.add(test_ticket)
            db.commit()
            db.refresh(test_ticket)

        print(f"✓ Using Agent: {agent_user.email} (ID: {agent_user.id})")
        print(f"✓ Using Ticket: {test_ticket.id}")

        # 3. Test Upload PDF
        pdf_bytes = create_sample_pdf()
        upload_file = UploadFile(
            file=io.BytesIO(pdf_bytes),
            filename="error_receipt.pdf",
            headers={"content-type": "application/pdf"}
        )

        att_resp = await upload_attachment(
            ticket_id=test_ticket.id,
            file=upload_file,
            db=db,
            current_user=agent_user,
        )

        assert att_resp.id is not None
        assert att_resp.filename == "error_receipt.pdf"
        assert att_resp.page_count >= 1
        attachment_id = att_resp.id
        print(f"✓ Step 1 Passed: PDF Uploaded successfully (ID: {attachment_id}, {att_resp.page_count} page(s))")

        # 4. Test List Attachments
        attachments = list_attachments(
            ticket_id=test_ticket.id,
            db=db,
            current_user=agent_user,
        )
        assert len(attachments) >= 1
        assert any(a.id == attachment_id for a in attachments)
        print(f"✓ Step 2 Passed: Ticket attachments listed ({len(attachments)} item(s) found)")

        # 5. Test Download / View Streaming Response
        download_resp = download_attachment(
            ticket_id=test_ticket.id,
            attachment_id=attachment_id,
            db=db,
            current_user=agent_user,
        )
        assert download_resp.media_type == "application/pdf"
        chunks = [chunk async for chunk in download_resp.body_iterator]
        downloaded_bytes = b"".join(chunks)
        assert len(downloaded_bytes) == len(pdf_bytes)
        print(f"✓ Step 3 Passed: PDF streaming response verified ({len(downloaded_bytes)} bytes)")

        # 6. Test AI-Powered PDF Analysis
        analysis_resp = await analyze_attachment(
            ticket_id=test_ticket.id,
            attachment_id=attachment_id,
            db=db,
            current_user=agent_user,
        )
        assert analysis_resp.id is not None
        assert analysis_resp.analysis_result is not None
        assert "document_summary" in analysis_resp.analysis_result
        print(f"✓ Step 4 Passed: AI PDF Analysis generated (Model: {analysis_resp.model_used}, Sandbox: {analysis_resp.sandbox_mode})")

        # 7. Test Retrieve Historical Analyses
        analyses_list = get_analyses(
            ticket_id=test_ticket.id,
            attachment_id=attachment_id,
            db=db,
            current_user=agent_user,
        )
        assert len(analyses_list) >= 1
        assert analyses_list[0].id == analysis_resp.id
        print(f"✓ Step 5 Passed: Saved analyses retrieved ({len(analyses_list)} record(s))")

        print("\n" + "="*60)
        print("🎉 ALL 5 WORKFLOW STEPS PASSED WITH 100% SUCCESS!")
        print("="*60)

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_direct_workflow_test())

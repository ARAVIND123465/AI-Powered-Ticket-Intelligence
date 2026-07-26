"""
generate_documents.py
---------------------
Generates a 20,000-row synthetic document dataset for training the
AI-Powered Ticket Intelligence fake/fraud detection system.

Each row represents a document upload with metadata simulating real-world
ticket submissions (IT Support Tickets) vs irrelevant uploads (movie tickets,
random screenshots, food receipts, etc.).

Usage:
    python scripts/generate_documents.py
"""

import csv
import os
import random
from datetime import datetime, timedelta
from faker import Faker

fake = Faker()
random.seed(7)

N = 20000

# Where to save the generated CSV
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "datasets")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "documents.csv")

doc_types = [
    "IT Support Ticket", "Movie Ticket", "Flight Ticket", "Train Ticket",
    "Bus Ticket", "Hotel Booking", "Restaurant Bill", "Food Delivery Receipt",
    "Shopping Invoice", "Payment Receipt", "Event Ticket", "Parking Ticket",
    "Courier Receipt", "Medical Bill", "Insurance Document", "Utility Bill",
    "College Fee Receipt", "Bank Statement", "Subscription Receipt",
    "Random Screenshot"
]

companies_by_type = {
    "IT Support Ticket": ["Microsoft", "Amazon", "Google", "IBM", "Deloitte", "Accenture", "Infosys", "TCS", "Cognizant", "ServiceNow"],
    "Movie Ticket": ["PVR Cinemas", "INOX", "AMC Theatres", "Cinepolis", "Regal Cinemas", "Vue Cinemas", "Cineworld"],
    "Flight Ticket": ["Emirates", "IndiGo", "Delta Air Lines", "American Airlines", "British Airways", "Qatar Airways", "Air India", "Lufthansa", "Singapore Airlines"],
    "Train Ticket": ["IRCTC", "Amtrak", "Eurostar", "Deutsche Bahn", "SNCF", "Indian Railways"],
    "Bus Ticket": ["RedBus", "Greyhound", "FlixBus", "National Express", "MegaBus"],
    "Hotel Booking": ["Marriott", "Hilton", "Taj Hotels", "OYO Rooms", "Hyatt", "Radisson Blu", "ITC Hotels"],
    "Restaurant Bill": ["Domino's Pizza", "Pizza Hut", "Barbeque Nation", "The Coffee Bean", "Olive Garden", "Local Bistro Co."],
    "Food Delivery Receipt": ["Swiggy", "Zomato", "Uber Eats", "DoorDash", "Grubhub"],
    "Shopping Invoice": ["Amazon", "Flipkart", "Walmart", "Target", "Myntra", "Best Buy"],
    "Payment Receipt": ["PayPal", "Razorpay", "Stripe", "Paytm", "Google Pay", "Venmo"],
    "Event Ticket": ["BookMyShow", "Ticketmaster", "Eventbrite", "Live Nation"],
    "Parking Ticket": ["City Parking Authority", "ParkMobile", "SpotHero", "Metro Parking Services"],
    "Courier Receipt": ["FedEx", "DHL Express", "Blue Dart", "UPS", "India Post"],
    "Medical Bill": ["Apollo Hospitals", "Fortis Healthcare", "Mayo Clinic", "Cleveland Clinic", "Max Healthcare"],
    "Insurance Document": ["LIC", "HDFC Life", "Allstate", "AXA", "ICICI Lombard", "State Farm"],
    "Utility Bill": ["BSES Rajdhani", "Con Edison", "British Gas", "PG&E", "Tata Power"],
    "College Fee Receipt": ["Anna University", "MIT", "Stanford University", "Delhi University", "IIT Bombay", "University of Toronto"],
    "Bank Statement": ["HDFC Bank", "JPMorgan Chase", "Bank of America", "ICICI Bank", "Citibank", "Wells Fargo"],
    "Subscription Receipt": ["Netflix", "Spotify", "Amazon Prime", "Adobe Creative Cloud", "Disney+", "YouTube Premium"],
    "Random Screenshot": ["N/A"]
}

countries = [
    "United States", "India", "United Kingdom", "Germany", "Canada",
    "Australia", "Singapore", "France", "Ireland", "Netherlands",
    "Philippines", "Spain", "UAE"
]

languages = ["English", "Tamil", "Hindi", "Spanish", "French"]

currency_by_country = {
    "United States": "USD", "India": "INR", "United Kingdom": "GBP",
    "Germany": "EUR", "Canada": "CAD", "Australia": "AUD",
    "Singapore": "SGD", "France": "EUR", "Ireland": "EUR",
    "Netherlands": "EUR", "Philippines": "PHP", "Spain": "EUR", "UAE": "AED"
}

image_types = ["Screenshot", "Scanned Document", "Photo", "PDF Export"]
file_types = ["jpg", "png", "pdf", "jpeg"]

status_by_type = {
    "IT Support Ticket": ["Open", "In Progress", "Resolved", "Closed", "Pending"],
    "Movie Ticket": ["Booked", "Used", "Cancelled", "Expired"],
    "Flight Ticket": ["Confirmed", "Cancelled", "Checked-In", "Completed"],
    "Train Ticket": ["Confirmed", "Waitlisted", "Cancelled", "Completed"],
    "Bus Ticket": ["Confirmed", "Cancelled", "Completed"],
    "Hotel Booking": ["Confirmed", "Cancelled", "Checked-Out", "No-Show"],
    "Restaurant Bill": ["Paid", "Pending", "Refunded"],
    "Food Delivery Receipt": ["Delivered", "Cancelled", "Refunded"],
    "Shopping Invoice": ["Delivered", "Processing", "Returned", "Cancelled"],
    "Payment Receipt": ["Success", "Failed", "Refunded", "Pending"],
    "Event Ticket": ["Confirmed", "Used", "Cancelled", "Expired"],
    "Parking Ticket": ["Paid", "Unpaid", "Disputed", "Overdue"],
    "Courier Receipt": ["Delivered", "In Transit", "Returned", "Lost"],
    "Medical Bill": ["Paid", "Pending", "Insurance Claimed", "Overdue"],
    "Insurance Document": ["Active", "Expired", "Claimed", "Lapsed"],
    "Utility Bill": ["Paid", "Unpaid", "Overdue", "Disputed"],
    "College Fee Receipt": ["Paid", "Pending", "Partially Paid"],
    "Bank Statement": ["Generated", "Reviewed", "Disputed"],
    "Subscription Receipt": ["Active", "Cancelled", "Renewed", "Failed"],
    "Random Screenshot": ["N/A"]
}

amount_range_by_type = {
    "IT Support Ticket": (0, 0),
    "Movie Ticket": (5, 30),
    "Flight Ticket": (80, 1500),
    "Train Ticket": (5, 200),
    "Bus Ticket": (5, 100),
    "Hotel Booking": (60, 800),
    "Restaurant Bill": (10, 200),
    "Food Delivery Receipt": (5, 80),
    "Shopping Invoice": (10, 2000),
    "Payment Receipt": (5, 5000),
    "Event Ticket": (10, 500),
    "Parking Ticket": (5, 150),
    "Courier Receipt": (5, 150),
    "Medical Bill": (20, 10000),
    "Insurance Document": (100, 5000),
    "Utility Bill": (10, 400),
    "College Fee Receipt": (100, 20000),
    "Bank Statement": (0, 0),
    "Subscription Receipt": (2, 50),
    "Random Screenshot": (0, 0)
}

ref_prefix = {
    "IT Support Ticket": "TCK", "Movie Ticket": "MOV", "Flight Ticket": "FLT",
    "Train Ticket": "TRN", "Bus Ticket": "BUS", "Hotel Booking": "HTL",
    "Restaurant Bill": "RST", "Food Delivery Receipt": "FDR",
    "Shopping Invoice": "INV", "Payment Receipt": "PAY", "Event Ticket": "EVT",
    "Parking Ticket": "PRK", "Courier Receipt": "CUR", "Medical Bill": "MED",
    "Insurance Document": "INS", "Utility Bill": "UTL",
    "College Fee Receipt": "CLG", "Bank Statement": "BNK",
    "Subscription Receipt": "SUB", "Random Screenshot": "N/A"
}

title_templates = {
    "IT Support Ticket": "IT Support Ticket - {sub}",
    "Movie Ticket": "{company} - Movie Booking Confirmation",
    "Flight Ticket": "{company} E-Ticket / Boarding Pass",
    "Train Ticket": "{company} Train Reservation Ticket",
    "Bus Ticket": "{company} Bus Ticket Confirmation",
    "Hotel Booking": "{company} Reservation Confirmation",
    "Restaurant Bill": "{company} Dine-In Bill",
    "Food Delivery Receipt": "{company} Order Receipt",
    "Shopping Invoice": "{company} Tax Invoice",
    "Payment Receipt": "{company} Payment Receipt",
    "Event Ticket": "{company} Event Ticket",
    "Parking Ticket": "{company} Parking Ticket",
    "Courier Receipt": "{company} Shipment Receipt",
    "Medical Bill": "{company} Patient Bill",
    "Insurance Document": "{company} Policy Document",
    "Utility Bill": "{company} Monthly Utility Bill",
    "College Fee Receipt": "{company} Fee Payment Receipt",
    "Bank Statement": "{company} Account Statement",
    "Subscription Receipt": "{company} Subscription Invoice",
    "Random Screenshot": "Untitled Screenshot"
}

description_templates = {
    "IT Support Ticket": "Support ticket raised regarding a technical issue reported by the customer to {company} help desk.",
    "Movie Ticket": "Booking confirmation for a movie show at {company}, including seat number and showtime details.",
    "Flight Ticket": "E-ticket issued by {company} confirming a flight booking with passenger and route details.",
    "Train Ticket": "Reservation ticket issued by {company} confirming seat and coach allocation for the journey.",
    "Bus Ticket": "Bus ticket confirmation issued by {company} with seat number and boarding point details.",
    "Hotel Booking": "Hotel reservation confirmation from {company} including check-in, check-out dates and room type.",
    "Restaurant Bill": "Itemized dine-in bill generated by {company} showing food items ordered and total amount.",
    "Food Delivery Receipt": "Order receipt from {company} showing items ordered, delivery address and total charged.",
    "Shopping Invoice": "Tax invoice from {company} for an online purchase, listing item details and payment method.",
    "Payment Receipt": "Payment confirmation receipt issued by {company} for a completed transaction.",
    "Event Ticket": "Event ticket issued by {company} confirming entry for the booked event and seating category.",
    "Parking Ticket": "Parking ticket issued by {company} indicating the vehicle, duration and applicable fee.",
    "Courier Receipt": "Shipment receipt from {company} confirming pickup and delivery details of a parcel.",
    "Medical Bill": "Patient billing statement from {company} listing consultation, tests and treatment charges.",
    "Insurance Document": "Insurance policy document issued by {company} detailing coverage and premium information.",
    "Utility Bill": "Monthly utility bill from {company} showing consumption units and amount payable.",
    "College Fee Receipt": "Fee payment receipt issued by {company} confirming tuition fee payment for the semester.",
    "Bank Statement": "Bank account statement from {company} listing recent transactions and account balance.",
    "Subscription Receipt": "Subscription renewal receipt from {company} confirming plan and billing period.",
    "Random Screenshot": "An unrelated screenshot uploaded that does not correspond to any recognizable ticket or receipt format."
}

reasons_genuine = [
    "All expected fields present and consistent with standard document format.",
    "Barcode/QR code verified and matches reference number pattern.",
    "Logo and formatting consistent with known company templates.",
    "Metadata and OCR text align with expected document structure.",
    "Signature and stamp present, document appears authentic."
]

reasons_suspicious = [
    "Missing key fields such as reference number or date.",
    "OCR text appears garbled or partially unreadable.",
    "Logo does not match official company branding.",
    "Barcode/QR code missing or unreadable.",
    "Document appears edited with inconsistent fonts or alignment.",
    "Uploaded image resolution too low to verify authenticity.",
    "Duplicate reference number detected across multiple submissions.",
    "Amount and currency format inconsistent with issuing country.",
    "No signature or stamp found where expected.",
    "Random unrelated image uploaded instead of the expected document."
]

start_date = datetime(2023, 1, 1)
end_date = datetime(2026, 7, 24)
range_days = (end_date - start_date).days

fieldnames = [
    "document_id", "document_type", "company_name", "customer_name", "email",
    "country", "language", "image_type", "file_type", "document_title",
    "description", "ocr_text", "is_ticket", "is_valid", "verification_status",
    "fraud_score", "confidence", "reason", "date", "amount", "currency",
    "reference_number", "barcode_present", "qr_code_present", "logo_present",
    "signature_present", "status"
]


def gen_email(name, company):
    domain = "".join(c for c in company.lower() if c.isalnum())[:15] or "mail"
    handle = name.lower().replace(" ", ".")
    handle = "".join(c for c in handle if c.isalnum() or c == ".")
    return f"{handle}{random.randint(1, 999)}@{domain}.com"


def gen_ocr_text(dtype, company, valid, amount, currency, ref, date_str):
    if dtype == "Random Screenshot":
        return random.choice([
            "lol thats so funny hahaha [meme image, no text data extracted]",
            "[Screenshot of a chat conversation, no ticket-related content found]",
            "[Image contains unrelated photo of a landscape]",
            "[Blank/mostly white image, OCR could not extract meaningful text]",
            "[Screenshot of a social media post, unrelated to any transaction]"
        ])
    if not valid:
        return random.choice([
            f"{company} ... [text partially cut off] ... Ref: {ref[:4]}XXX ... amount unreadable",
            "[OCR extraction failed - blurry scan]",
            f"{company} Recei... [rest of document unreadable due to poor scan quality]",
            "[Text overlapping due to double exposure in scanned image]"
        ])
    base = f"{company} | Ref No: {ref} | Date: {date_str}"
    if amount:
        base += f" | Amount: {currency} {amount}"
    base += " | Status: Verified document with standard layout and fields detected."
    return base


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for i in range(1, N + 1):
            document_id = f"DOC-{200000 + i}"
            dtype = random.choice(doc_types)
            company = random.choice(companies_by_type[dtype])
            name = fake.name()
            country = random.choice(countries)
            currency = currency_by_country[country]
            email = gen_email(name, company if company != "N/A" else "unknown")
            language = random.choices(languages, weights=[70, 8, 10, 7, 5], k=1)[0]

            image_type = random.choice(image_types)
            file_type = random.choice(file_types)

            is_ticket = "No" if dtype == "Random Screenshot" else "Yes"

            verification_status = random.choices(
                ["Genuine", "Suspicious"], weights=[60, 40], k=1
            )[0]
            is_valid = (
                "Yes"
                if verification_status == "Genuine" and dtype != "Random Screenshot"
                else "No"
            )

            fraud_score = (
                random.randint(0, 25)
                if verification_status == "Genuine"
                else random.randint(45, 100)
            )
            confidence = random.randint(50, 100)

            reason = (
                random.choice(reasons_genuine)
                if verification_status == "Genuine" and dtype != "Random Screenshot"
                else random.choice(reasons_suspicious)
            )

            created_dt = start_date + timedelta(
                days=random.randint(0, range_days),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
            )
            date_str = created_dt.strftime("%Y-%m-%d")

            low, high = amount_range_by_type[dtype]
            amount = round(random.uniform(low, high), 2) if high > 0 else ""
            cur = currency if amount != "" else ""

            prefix = ref_prefix[dtype]
            reference_number = (
                f"{prefix}-{random.randint(100000, 999999)}"
                if prefix != "N/A"
                else ""
            )

            barcode_present = (
                random.choices(["Yes", "No"], weights=[65, 35], k=1)[0]
                if dtype != "Random Screenshot"
                else "No"
            )
            qr_code_present = (
                random.choices(["Yes", "No"], weights=[55, 45], k=1)[0]
                if dtype != "Random Screenshot"
                else "No"
            )
            logo_present = (
                random.choices(["Yes", "No"], weights=[75, 25], k=1)[0]
                if dtype != "Random Screenshot"
                else "No"
            )
            signature_present = (
                random.choices(["Yes", "No"], weights=[35, 65], k=1)[0]
                if dtype
                in (
                    "Medical Bill",
                    "Insurance Document",
                    "College Fee Receipt",
                    "Bank Statement",
                )
                else random.choices(["Yes", "No"], weights=[15, 85], k=1)[0]
            )

            status_list = status_by_type[dtype]
            status = random.choice(status_list)

            document_title = title_templates[dtype].format(
                company=company,
                sub=random.choice([
                    "Login Issue", "Payment Failure", "Network Issue",
                    "Access Request", "Bug Report"
                ]),
            )
            description = description_templates[dtype].format(company=company)

            ocr_text = gen_ocr_text(
                dtype, company, is_valid == "Yes", amount, cur, reference_number, date_str
            )

            writer.writerow({
                "document_id": document_id,
                "document_type": dtype,
                "company_name": company,
                "customer_name": name,
                "email": email,
                "country": country,
                "language": language,
                "image_type": image_type,
                "file_type": file_type,
                "document_title": document_title,
                "description": description,
                "ocr_text": ocr_text,
                "is_ticket": is_ticket,
                "is_valid": is_valid,
                "verification_status": verification_status,
                "fraud_score": fraud_score,
                "confidence": confidence,
                "reason": reason,
                "date": date_str,
                "amount": amount,
                "currency": cur,
                "reference_number": reference_number,
                "barcode_present": barcode_present,
                "qr_code_present": qr_code_present,
                "logo_present": logo_present,
                "signature_present": signature_present,
                "status": status,
            })

            if i % 5000 == 0:
                print(f"{i} rows generated")

    print(f"DONE — {N} rows written to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

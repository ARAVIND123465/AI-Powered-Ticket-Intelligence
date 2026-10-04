"""
scripts/train_models.py
-----------------------
Generates training datasets and trains robust TF-IDF + Classifier models for:
  1. Ticket Category Classification (ticket_classifier.pkl, tfidf_vectorizer.pkl, label_encoder.pkl)
  2. Ticket Priority Prediction (priority_model.pkl, priority_vectorizer.pkl, priority_label_encoder.pkl)

Outputs are saved to both `models/` and `backend/models/`.
"""

import os
import pickle
import numpy as np
import pandas as pd
from scipy.sparse import hstack, csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(ROOT_DIR, "models")
BACKEND_MODELS_DIR = os.path.join(ROOT_DIR, "backend", "models")
DATASETS_DIR = os.path.join(ROOT_DIR, "datasets")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(BACKEND_MODELS_DIR, exist_ok=True)
os.makedirs(DATASETS_DIR, exist_ok=True)

# --------------------------------------------------------------------------- #
# Comprehensive Seed Data for Ticket Classification & Priority
# --------------------------------------------------------------------------- #
TRAINING_SAMPLES = [
    # Payment & Billing
    ("Payment deducted but booking failed", "The amount of $45 was deducted from my bank account, but no booking confirmation was generated.", "Payment", "High"),
    ("Charged twice for the same booking", "I noticed duplicate charges on my credit card statement for transaction ORD-9921.", "Payment", "High"),
    ("Payment gateway error 500 during checkout", "When I tried to submit payment via credit card the gateway timed out and charged me.", "Payment", "High"),
    ("Money taken from account but booking unsuccessful", "My money was debited but the ticket booking was cancelled and marked failed.", "Payment", "High"),
    ("Transaction failed at final payment stage", "Attempted payment via debit card, received transaction failure message but money deducted.", "Payment", "High"),
    ("Need invoice for tax purposes", "Can you please email me the official VAT invoice and tax receipt for my last subscription?", "Billing", "Low"),
    ("Billing cycle query and pricing information", "When will my next billing cycle start and how can I change my payment credit card?", "Billing", "Low"),
    ("Unexpected renewal charge on my card", "My card was charged for annual subscription renewal without prior notice.", "Billing", "Medium"),
    ("Overcharged on monthly statement", "My monthly invoice is higher than the agreed rate. Please adjust the billing charges.", "Billing", "Medium"),

    # Refund
    ("Requesting refund for cancelled flight", "My flight was cancelled by the airline and I would like a full refund to my bank.", "Refund", "High"),
    ("Refund status inquiry", "It has been 10 days since my return was accepted. When will my refund credit appear?", "Refund", "Medium"),
    ("Unable to process refund for order", "The customer service portal displays an error whenever I request refund for order #1234.", "Refund", "High"),
    ("Cancel booking and issue refund", "I need to cancel my trip due to illness. Please issue an immediate refund.", "Refund", "High"),
    ("Where is my refund", "Refund was promised within 3 to 5 business days but still not received in my account.", "Refund", "High"),

    # Login & Account
    ("Cannot login to account", "I am getting invalid password error repeatedly when trying to log into my corporate portal.", "Login", "High"),
    ("Password reset link not arriving", "Requested password reset email multiple times but no verification email received.", "Login", "Medium"),
    ("SSO login returning 403 forbidden", "Single sign-on via Okta fails with 403 forbidden access denied error.", "Login", "High"),
    ("Two factor authentication 2FA code invalid", "The authenticator app OTP is rejected every time I enter it on login screen.", "Login", "High"),
    ("Account locked after multiple failed attempts", "My account has been locked. Please unlock it so I can access my workspace.", "Login", "High"),
    ("Unable to update account information", "Whenever I edit my phone number or email in profile settings, the changes do not save.", "Account", "Medium"),
    ("How to update profile picture", "I would like to know how to change my profile picture and display avatar.", "Account", "Low"),
    ("Change account email address", "Need assistance updating the primary email address on my corporate helpdesk account.", "Account", "Low"),
    ("Delete my user account and personal data", "I wish to close my account and request GDPR data deletion for all my stored records.", "Account", "Medium"),

    # Technical & Bug & Software
    ("Application crashes immediately on launch", "When opening the mobile app on iOS, it crashes after the splash screen.", "Technical", "High"),
    ("500 Internal Server Error when saving form", "Clicking submit triggers a 500 internal server error with uncaught exception in API.", "Technical", "High"),
    ("Database connection pool timeout error", "Backend API logs show database connection pool exhausted resulting in service degradation.", "Technical", "Critical"),
    ("Dashboard charts not loading on Safari", "Charts display blank canvas with SVG rendering error on Safari browser.", "Bug", "Medium"),
    ("Export to CSV button does not respond", "Clicking export reports to Excel or CSV triggers no download action.", "Bug", "Low"),
    ("UI formatting broken on tablet screen", "Text overlaps the navigation bar when viewing dashboard in portrait mode on iPad.", "Bug", "Low"),
    ("Software license key activation failed", "Entered the enterprise product key but received error key is invalid or expired.", "Software", "Medium"),
    ("Cannot install latest desktop client update", "The updater fails at 85% with an error code ERR_DISK_PERM.", "Software", "Medium"),

    # Network & Security & Access Control
    ("VPN not connecting since this morning", "I cannot connect to the office VPN. The client hangs at authenticating.", "Network", "High"),
    ("VPN connection drops every 30 minutes", "Corporate VPN disconnects automatically every 30 minutes due to lease limit.", "Network", "Medium"),
    ("DNS resolution failure for internal domains", "Cannot access internal dev servers via hostname. DNS server unreachable.", "Network", "High"),
    ("Office Wi-Fi slow and dropping packets", "Severe packet loss on the 5th floor wireless network affecting video calls.", "Network", "Medium"),
    ("Suspected phishing email received by team", "Received an email pretending to be IT security asking for password verification.", "Security", "High"),
    ("Security alert unauthorized login from unknown IP", "Received security alert about login attempt from another country.", "Security", "Critical"),
    ("Malware detected on workstation", "Antivirus software quarantined a suspicious Trojan binary in the downloads folder.", "Security", "Critical"),
    ("Request access to production database", "Need read-only access to customer production database for debugging transaction errors.", "Access Control", "Medium"),
    ("Revoke access for departing employee", "Please immediately revoke all system credentials and SSO access for employee ID 9921.", "Access Control", "High"),
    ("Add user to GitHub engineering organization", "New hire onboarding: please grant developer permissions to the enterprise repos.", "Access Control", "Low"),

    # Hardware
    ("Laptop screen flickering and going black", "The display on my ThinkPad flickers whenever the hinge is moved.", "Hardware", "Medium"),
    ("Workstation will not turn on", "Desktop PC shows no power LED and will not boot when power button is pressed.", "Hardware", "High"),
    ("Office printer paper jam and offline", "Main floor laser printer is jammed and shows offline error on print server.", "Hardware", "Low"),
    ("Monitor HDMI port not detecting video signal", "External Dell monitor does not receive display signal from USB-C dock.", "Hardware", "Low"),

    # Delivery & Feature Request & General Inquiry
    ("Package marked delivered but not received", "Courier tracking status shows package was delivered, but nothing arrived at my address.", "Delivery", "High"),
    ("Delayed shipment for order", "Order was supposed to arrive two days ago. Tracking status has not updated.", "Delivery", "Medium"),
    ("Change delivery shipping address", "Need to change the delivery address before the shipment leaves the fulfillment center.", "Delivery", "Medium"),
    ("Feature request: Dark mode support", "Would love to see a native dark mode theme added to the web application.", "Feature Request", "Low"),
    ("Feature request: Slack notification integration", "Can we get real-time ticket alerts delivered directly into a Slack channel?", "Feature Request", "Low"),
    ("General inquiry regarding support business hours", "What are the standard SLA response times and weekend support hours?", "General Inquiry", "Low"),
    ("How does the ticket intelligence scoring work", "Could you provide documentation on how AI priority ratings are calculated?", "General Inquiry", "Low"),

    # Critical Incidents
    ("Complete system outage production down", "All users affected. The entire production website is down and throwing 502 bad gateway.", "Technical", "Critical"),
    ("Data loss detected in customer database", "Critical incident: records from the last 2 hours are missing from database tables.", "Security", "Critical"),
    ("Production payment processing completely down", "All customer checkouts failing worldwide. Immediate emergency response required.", "Payment", "Critical"),
]

# Generate more training variation by paraphrasing/expanding
expanded_samples = []
for sub, desc, cat, prio in TRAINING_SAMPLES:
    expanded_samples.append((sub, desc, cat, prio))
    # Variations
    expanded_samples.append((f"[Urgent] {sub}", desc, cat, prio))
    expanded_samples.append((sub, f"{desc} Please assist as soon as possible.", cat, prio))
    expanded_samples.append((sub.lower(), desc.lower(), cat, prio))

df = pd.DataFrame(expanded_samples, columns=["subject", "description", "category", "priority"])

# Save train.csv and test.csv so datasets/ is complete
train_df, test_df = train_test_split(df, test_size=0.15, random_state=42, stratify=df["category"])
train_df.to_csv(os.path.join(DATASETS_DIR, "train.csv"), index=False)
test_df.to_csv(os.path.join(DATASETS_DIR, "test.csv"), index=False)
df.to_csv(os.path.join(DATASETS_DIR, "historical_tickets.csv"), index=False)
print(f"Saved {len(train_df)} training and {len(test_df)} test ticket records to datasets/")

# --------------------------------------------------------------------------- #
# 1. Train Ticket Category Classifier
# --------------------------------------------------------------------------- #
print("\n--- Training Category Classifier ---")
clean_texts = [f"{s} {d}".lower() for s, d in zip(df["subject"], df["description"])]
category_vectorizer = TfidfVectorizer(max_features=1500, ngram_range=(1, 2), stop_words="english")
X_cat = category_vectorizer.fit_transform(clean_texts)

category_encoder = LabelEncoder()
y_cat = category_encoder.fit_transform(df["category"])

cat_clf = LogisticRegression(C=2.0, max_iter=1000, class_weight="balanced")
cat_clf.fit(X_cat, y_cat)

score = cat_clf.score(X_cat, y_cat)
print(f"Category Classifier fitted on {len(category_encoder.classes_)} classes. Training Accuracy: {score:.2%}")

# --------------------------------------------------------------------------- #
# 2. Train Ticket Priority Predictor
# --------------------------------------------------------------------------- #
print("\n--- Training Priority Predictor ---")
CRITICAL_KEYWORDS = [
    "production down", "system down", "outage", "cannot access", "security breach",
    "data loss", "all users affected", "complete failure", "server down",
    "payment failing", "cannot login", "critical", "urgent", "asap", "emergency",
]
HIGH_KEYWORDS = [
    "not working", "broken", "error", "blocked", "cannot work", "high priority",
    "multiple users", "deadline", "important", "deducted", "failed", "refund",
]

def get_kw_features(texts):
    feats = []
    for t in texts:
        tl = t.lower()
        crit = sum(1 for kw in CRITICAL_KEYWORDS if kw in tl)
        high = sum(1 for kw in HIGH_KEYWORDS if kw in tl)
        excl = tl.count("!")
        length = min(len(tl.split()), 200) / 200.0
        feats.append([crit, high, excl, length])
    return np.array(feats)

priority_vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2), stop_words="english")
X_prio_tfidf = priority_vectorizer.fit_transform(clean_texts)
kw_feats = csr_matrix(get_kw_features(clean_texts))
X_prio = hstack([X_prio_tfidf, kw_feats]).tocsr()

priority_encoder = LabelEncoder()
y_prio = priority_encoder.fit_transform(df["priority"])

prio_clf = LogisticRegression(C=3.0, max_iter=1000, class_weight="balanced")
prio_clf.fit(X_prio, y_prio)

prio_score = prio_clf.score(X_prio, y_prio)
print(f"Priority Classifier fitted on classes: {list(priority_encoder.classes_)}. Training Accuracy: {prio_score:.2%}")

# --------------------------------------------------------------------------- #
# 3. Save Model Artifacts
# --------------------------------------------------------------------------- #
artifacts = {
    "ticket_classifier.pkl": cat_clf,
    "tfidf_vectorizer.pkl": category_vectorizer,
    "label_encoder.pkl": category_encoder,
    "priority_model.pkl": prio_clf,
    "priority_vectorizer.pkl": priority_vectorizer,
    "priority_label_encoder.pkl": priority_encoder,
}

for target_dir in [MODELS_DIR, BACKEND_MODELS_DIR]:
    for filename, obj in artifacts.items():
        filepath = os.path.join(target_dir, filename)
        with open(filepath, "wb") as f:
            pickle.dump(obj, f)
        print(f"Saved -> {filepath} ({os.path.getsize(filepath):,} bytes)")

print("\nModel training and artifact generation completed successfully!")

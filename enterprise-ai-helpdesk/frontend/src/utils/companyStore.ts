export interface CompanyRegistration {
  id: string;
  name: string;
  email: string;
  domain: string;
  category: 'Transport & Logistics' | 'Travel & Booking' | 'IT Services & Cloud' | 'Entertainment & Media' | 'Healthcare' | 'Banking & Finance' | 'E-Commerce';
  plan: 'Starter' | 'Professional' | 'Enterprise';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  registered_at: string;
  contact_person: string;
  contact_phone?: string;
  notes?: string;
  preset_sample_ticket?: {
    type: string;
    sample_title: string;
    sample_ocr: string;
    is_valid_it_ticket: boolean;
  };
}

const STORAGE_KEY = 'helpdesk_registered_companies';

const DEFAULT_COMPANIES: CompanyRegistration[] = [
  {
    id: 'CMP-101',
    name: 'RedBus',
    email: 'admin@redbus.in',
    domain: 'redbus.in',
    category: 'Transport & Logistics',
    plan: 'Enterprise',
    status: 'Approved',
    registered_at: '2026-06-10T10:00:00Z',
    contact_person: 'Prakash Kumar',
    preset_sample_ticket: {
      type: 'Bus Ticket',
      sample_title: 'RedBus Bus Ticket Confirmation',
      sample_ocr: 'RedBus | Bus Ticket Confirmation | Ref: BUS-443281 | Date: 2026-07-22 | Route: Chennai → Bangalore | Seat: 12B | Boarding: Koyambedu | Amount: INR 850.00',
      is_valid_it_ticket: false,
    },
  },
  {
    id: 'CMP-102',
    name: 'IRCTC',
    email: 'helpdesk@irctc.co.in',
    domain: 'irctc.co.in',
    category: 'Travel & Booking',
    plan: 'Enterprise',
    status: 'Approved',
    registered_at: '2026-06-12T14:30:00Z',
    contact_person: 'Sunita Sharma',
    preset_sample_ticket: {
      type: 'Train Ticket',
      sample_title: 'IRCTC Train Reservation Ticket',
      sample_ocr: 'IRCTC | Train Reservation Ticket | PNR: TRN-839201 | Date: 2026-07-25 | Train: 12621 Chennai Mail | Coach: S4 | Berth: 32/LB | Route: MAS → NDLS | Amount: INR 1250.00',
      is_valid_it_ticket: false,
    },
  },
  {
    id: 'CMP-103',
    name: 'ServiceNow',
    email: 'support-admin@servicenow.com',
    domain: 'servicenow.com',
    category: 'IT Services & Cloud',
    plan: 'Enterprise',
    status: 'Approved',
    registered_at: '2026-05-01T09:15:00Z',
    contact_person: 'David Miller',
    preset_sample_ticket: {
      type: 'IT Support Ticket',
      sample_title: 'IT Support Ticket - System Error Report',
      sample_ocr: 'ERROR: Payment Transaction Failed. Status Code: 500 Internal Server Error.\nTransaction ID: TXN-88349281\nTimestamp: 2026-07-03T08:00:00Z',
      is_valid_it_ticket: true,
    },
  },
  {
    id: 'CMP-104',
    name: 'PVR Cinemas',
    email: 'corporate@pvrcinemas.com',
    domain: 'pvrcinemas.com',
    category: 'Entertainment & Media',
    plan: 'Professional',
    status: 'Approved',
    registered_at: '2026-06-18T11:20:00Z',
    contact_person: 'Ananya Roy',
    preset_sample_ticket: {
      type: 'Movie Ticket',
      sample_title: 'PVR Cinemas - Movie Booking Confirmation',
      sample_ocr: 'PVR Cinemas | Ref No: MOV-384921 | Date: 2026-07-20 | Screen: 4 | Seat: H12 | Movie: Inception 2 | Showtime: 7:30 PM | Amount: INR 350.00',
      is_valid_it_ticket: false,
    },
  },
  {
    id: 'CMP-105',
    name: 'Apollo Hospitals',
    email: 'billing-tech@apollohospitals.com',
    domain: 'apollohospitals.com',
    category: 'Healthcare',
    plan: 'Enterprise',
    status: 'Approved',
    registered_at: '2026-06-25T16:00:00Z',
    contact_person: 'Dr. Ramesh Nathan',
    preset_sample_ticket: {
      type: 'Medical Bill',
      sample_title: 'Apollo Hospitals Patient Bill',
      sample_ocr: 'Apollo Hospitals | Patient Bill | Ref: MED-661234 | Date: 2026-07-15 | Consultation: Dr. Sharma | Tests: CBC, Lipid Panel | Total: INR 4500.00',
      is_valid_it_ticket: false,
    },
  },
  {
    id: 'CMP-106',
    name: 'Metro Express Logistics',
    email: 'admin@metroexpress.io',
    domain: 'metroexpress.io',
    category: 'Transport & Logistics',
    plan: 'Starter',
    status: 'Pending',
    registered_at: '2026-07-22T08:45:00Z',
    contact_person: 'Vikram Singh',
    notes: 'Requesting onboarding approval for 50 customer support agents.',
  },
  {
    id: 'CMP-107',
    name: 'FinCorp Global',
    email: 'it-sec@fincorglobal.com',
    domain: 'fincorglobal.com',
    category: 'Banking & Finance',
    plan: 'Enterprise',
    status: 'Pending',
    registered_at: '2026-07-24T12:00:00Z',
    contact_person: 'Sarah Jenkins',
    notes: 'Enterprise evaluation tenant request.',
  },
];

export const companyStore = {
  getCompanies(): CompanyRegistration[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMPANIES));
      return DEFAULT_COMPANIES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_COMPANIES;
    }
  },

  registerCompany(data: Omit<CompanyRegistration, 'id' | 'status' | 'registered_at'>): CompanyRegistration {
    const companies = this.getCompanies();
    const nextId = `CMP-${100 + companies.length + 1}`;
    
    const newCompany: CompanyRegistration = {
      ...data,
      id: nextId,
      status: 'Pending',
      registered_at: new Date().toISOString(),
    };

    companies.unshift(newCompany);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
    return newCompany;
  },

  approveCompany(id: string): CompanyRegistration | null {
    const companies = this.getCompanies();
    const comp = companies.find((c) => c.id === id);
    if (comp) {
      comp.status = 'Approved';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
      return comp;
    }
    return null;
  },

  rejectCompany(id: string): CompanyRegistration | null {
    const companies = this.getCompanies();
    const comp = companies.find((c) => c.id === id);
    if (comp) {
      comp.status = 'Rejected';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
      return comp;
    }
    return null;
  },
};

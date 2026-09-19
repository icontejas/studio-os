-- ==============================================================================
-- Migration 003: Realistic Seed Demo Data for IconTejas Studio
-- ==============================================================================

-- 1. Create Demo Business
INSERT INTO public.businesses (
    id, name, brand_name, tagline, phone, email, website, address, gstin, upi_id, currency
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'IconTejas Studio',
    'ICONTEJAS',
    'CINEMATOGRAPHY · FILMS · CREATIVE',
    '+91 98765 43210',
    'contact@icontejas.com',
    'https://icontejas.com',
    'Studio 402, Creative Hub, Gurgaon, Haryana, India',
    '07AAAAA0000A1Z5',
    'icontejas@upi',
    'INR'
) ON CONFLICT (id) DO NOTHING;

-- 2. Services
INSERT INTO public.services (id, business_id, name, description, default_price, category) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Car Delivery Basic', '1-hour cinematic delivery shoot + 1 edited reel', 7000.00, 'Videography'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Car Delivery Standard', '2-hour shoot + 2 reels + 15 edited photographs', 12000.00, 'Videography'),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Car Delivery Premium', '3-hour shoot + 3 reels + 30 photos + Drone coverage', 20000.00, 'Videography'),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Instagram Reel (Standalone)', 'High-impact 30s 4K vertical reel with sound design', 2500.00, 'Videography'),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Cinematic Photography', '25 graded high-resolution automotive/event photographs', 3500.00, 'Photography'),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Drone 4K Coverage', 'Licensed aerial cinematography & location establishing shots', 6000.00, 'Aerial')
ON CONFLICT (id) DO NOTHING;

-- 3. Clients
INSERT INTO public.clients (id, business_id, name, phone, email, company, billing_address, gstin, notes, portal_token) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Rahul Sharma', '+91 98765 43210', 'rahul@example.com', 'Individual Client', 'Golf Course Road, DLF Phase 5, Gurgaon', NULL, 'BMW X5 owner, prefers clean color grading', 'portal-rahul-sharma'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ABC Motors', '+91 98111 22334', 'accounts@abcmotors.in', 'ABC Motors Pvt Ltd', 'Sector 18, Noida, Uttar Pradesh', '09AAACA1234F1Z8', 'Regular commercial automotive dealership', 'portal-abc-motors'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'BMW Delhi', '+91 98222 33445', 'events@bmwdelhi.com', 'Deutsche Motoren BMW', 'Mathura Road, Mohan Cooperative, New Delhi', '07AABCB5678G1Z2', 'Showroom deliveries & flagship launch events', 'portal-bmw-delhi'),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Aman Verma', '+91 98333 44556', 'aman@vermagroup.com', 'Verma Enterprises', 'Cyber City, Phase 2, Gurgaon', NULL, 'Porsche 911 delivery & weekend rally footage', 'portal-aman-verma'),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Mercedes-Benz T&T', '+91 98444 55667', 'marketing@tandtmotors.com', 'T&T Motors Mercedes-Benz', 'Gurgaon-Faridabad Road, Gurgaon', '07AABCT9988H1Z1', 'Quarterly campaign videos and customer handovers', 'portal-mercedes-tt'),
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Priya Mehta', '+91 98555 66778', 'priya@mehtadesign.co', 'Studio Mehta', 'Hauz Khas Village, New Delhi', NULL, 'Architectural reel & personal lifestyle shoot', 'portal-priya-mehta'),
('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Urban Auto', '+91 98666 77889', 'contact@urbanauto.in', 'Urban Auto Custom Works', 'Okhla Phase 3, New Delhi', '07AAAFU4321J1Z3', 'Custom car wraps and detailing transformation reels', 'portal-urban-auto')
ON CONFLICT (id) DO NOTHING;

-- 4. Projects
INSERT INTO public.projects (id, business_id, client_id, title, description, project_type, status, shoot_date, start_time, location, total_amount, advance_amount, due_date) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'BMW X5 Delivery Film', 'Cinematic handover film + 2 reels + drone visuals', 'Car Delivery', 'EDITING', '2026-09-19', '11:30', 'BMW Gurgaon Showroom', 15000.00, 7000.00, '2026-09-24'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Festive Promotional Campaign', 'Dealership 3-car showcase commercial for YouTube & Meta Ads', 'Automotive Promo', 'SHOOTING', '2026-09-20', '14:00', 'Sector 18 Studio & Track, Noida', 35000.00, 15000.00, '2026-09-28'),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'M4 Competition Launch Reel', 'Track day cinematic reel with dynamic sound effects', 'Instagram Reel', 'REVIEW', '2026-09-15', '09:00', 'Buddh International Circuit, Greater Noida', 22000.00, 22000.00, '2026-09-22'),
('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Mercedes C-Class Delivery', 'Premium handover film + 30 edited photos', 'Car Delivery', 'DELIVERED', '2026-09-12', '16:00', 'T&T Motors Showroom, Gurgaon', 18000.00, 18000.00, '2026-09-18')
ON CONFLICT (id) DO NOTHING;

-- 5. Shoots
INSERT INTO public.shoots (id, business_id, project_id, client_id, title, shoot_date, start_time, end_time, location, shoot_type, amount, status) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'BMW X5 Delivery Shoot', '2026-09-19', '11:30', '13:30', 'BMW Gurgaon Showroom, Golf Course Rd', 'Car Delivery', 15000.00, 'Upcoming'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'ABC Motors Festive Commercial', '2026-09-20', '14:00', '18:00', 'Sector 18 Showroom & Noida Expressway', 'Automotive Promo', 35000.00, 'Upcoming')
ON CONFLICT (id) DO NOTHING;

-- 6. Quotations
INSERT INTO public.quotations (id, business_id, client_id, project_id, quotation_number, status, subtotal, discount, tax, total, valid_until) VALUES
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'QT-104', 'ACCEPTED', 15000.00, 0.00, 0.00, 15000.00, '2026-09-23'),
('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'QT-105', 'ACCEPTED', 35000.00, 0.00, 0.00, 35000.00, '2026-09-24'),
('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', NULL, 'QT-106', 'SENT', 25000.00, 0.00, 0.00, 25000.00, '2026-09-25')
ON CONFLICT (id) DO NOTHING;

-- 7. Invoices
INSERT INTO public.invoices (id, business_id, client_id, project_id, quotation_id, invoice_number, status, subtotal, discount, tax, total, paid_amount, balance, due_date) VALUES
('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'INV-104', 'PARTIALLY_PAID', 15000.00, 0.00, 0.00, 15000.00, 7000.00, 8000.00, '2026-09-14'),
('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 'INV-105', 'PARTIALLY_PAID', 35000.00, 0.00, 0.00, 35000.00, 15000.00, 20000.00, '2026-09-28'),
('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', NULL, 'INV-103', 'PAID', 22000.00, 0.00, 0.00, 22000.00, 22000.00, 0.00, '2026-09-16'),
('10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000004', NULL, 'INV-102', 'PAID', 18000.00, 0.00, 0.00, 18000.00, 18000.00, 0.00, '2026-09-12')
ON CONFLICT (id) DO NOTHING;

-- 8. Payments
INSERT INTO public.payments (id, business_id, invoice_id, client_id, amount, payment_date, payment_method, reference, notes) VALUES
('20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 7000.00, '2026-09-16', 'UPI', 'UPI/260916/8839201', '50% Booking advance received via GPay'),
('20000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 15000.00, '2026-09-17', 'BANK_TRANSFER', 'NEFT/HDFC/992011', 'Project mobilization advance'),
('20000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 22000.00, '2026-09-16', 'UPI', 'UPI/260916/5544332', 'Full payment for M4 Track Day Reel'),
('20000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005', 18000.00, '2026-09-12', 'BANK_TRANSFER', 'IMPS/T&T/882190', 'Settled on final drive delivery')
ON CONFLICT (id) DO NOTHING;

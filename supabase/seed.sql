-- ==========================================================
-- StudioOS — Seed Demo Data (IconTejas Studio)
-- ==========================================================

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
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Drone 4K Coverage', 'Licensed aerial cinematography & location establishing shots', 6000.00, 'Aerial');

-- 3. Clients
INSERT INTO public.clients (id, business_id, name, phone, email, company, billing_address, gstin, notes, portal_token) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Rahul Sharma', '+91 98765 43210', 'rahul@example.com', 'Individual Client', 'Golf Course Road, DLF Phase 5, Gurgaon', NULL, 'BMW X5 owner, prefers clean color grading', 'token-rahul-sharma-123'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ABC Motors', '+91 98111 22334', 'accounts@abcmotors.in', 'ABC Motors Pvt Ltd', 'Sector 18, Noida, Uttar Pradesh', '09AAACA1234F1Z8', 'Regular commercial automotive dealership', 'token-abc-motors-456'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'BMW Delhi', '+91 98222 33445', 'events@bmwdelhi.com', 'Deutsche Motoren BMW', 'Mathura Road, Mohan Cooperative, New Delhi', '07AABCB5678G1Z2', 'Showroom deliveries & flagship launch events', 'token-bmw-delhi-789'),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Aman Verma', '+91 98333 44556', 'aman@vermagroup.com', 'Verma Enterprises', 'Cyber City, Phase 2, Gurgaon', NULL, 'Porsche 911 delivery & weekend rally footage', 'token-aman-verma-321'),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Mercedes-Benz T&T', '+91 98444 55667', 'marketing@tandtmotors.com', 'T&T Motors Mercedes-Benz', 'Gurgaon-Faridabad Road, Gurgaon', '07AABCT9988H1Z1', 'Quarterly campaign videos and customer handovers', 'token-mercedes-654'),
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Priya Mehta', '+91 98555 66778', 'priya@mehtadesign.co', 'Studio Mehta', 'Hauz Khas Village, New Delhi', NULL, 'Architectural reel & personal lifestyle shoot', 'token-priya-mehta-987');

-- 4. Projects
INSERT INTO public.projects (id, business_id, client_id, title, description, project_type, status, shoot_date, start_time, location, total_amount, advance_amount, due_date) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'BMW X5 Delivery Film', 'Cinematic handover film + 2 reels + drone visuals', 'Car Delivery', 'EDITING', '2026-09-19', '11:30', 'BMW Gurgaon Showroom', 15000.00, 7000.00, '2026-09-24'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Festive Promotional Campaign', 'Dealership 3-car showcase commercial for YouTube & Meta Ads', 'Automotive Promo', 'SHOOTING', '2026-09-20', '14:00', 'Sector 18 Studio & Track, Noida', 35000.00, 15000.00, '2026-09-28'),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'M4 Competition Launch Reel', 'Track day cinematic reel with dynamic sound effects', 'Instagram Reel', 'REVIEW', '2026-09-15', '09:00', 'Buddh International Circuit, Greater Noida', 22000.00, 22000.00, '2026-09-22'),
('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Mercedes C-Class Delivery', 'Premium handover film + 30 edited photos', 'Car Delivery', 'DELIVERED', '2026-09-12', '16:00', 'T&T Motors Showroom, Gurgaon', 18000.00, 18000.00, '2026-09-18');

-- 5. Shoots
INSERT INTO public.shoots (id, business_id, project_id, client_id, title, shoot_date, start_time, end_time, location, shoot_type, amount, status) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'BMW X5 Delivery Shoot', '2026-09-19', '11:30', '13:30', 'BMW Gurgaon Showroom, Golf Course Rd', 'Car Delivery', 15000.00, 'Upcoming'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'ABC Motors Festive Commercial', '2026-09-20', '14:00', '18:00', 'Sector 18 Showroom & Noida Expressway', 'Automotive Promo', 35000.00, 'Upcoming'),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'BMW M4 Track Day Cinematography', '2026-09-15', '09:00', '13:00', 'BIC Greater Noida', 'Instagram Reel', 22000.00, 'Completed');

-- 6. Quotations
INSERT INTO public.quotations (id, business_id, client_id, project_id, quotation_number, status, subtotal, discount, tax, total, valid_until) VALUES
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'QT-104', 'ACCEPTED', 15000.00, 0.00, 0.00, 15000.00, '2026-09-23'),
('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'QT-105', 'ACCEPTED', 35000.00, 0.00, 0.00, 35000.00, '2026-09-24'),
('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', NULL, 'QT-106', 'SENT', 25000.00, 0.00, 0.00, 25000.00, '2026-09-25');

-- 7. Invoices
INSERT INTO public.invoices (id, business_id, client_id, project_id, quotation_id, invoice_number, status, subtotal, discount, tax, total, paid_amount, balance, due_date) VALUES
('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'INV-104', 'PARTIALLY_PAID', 15000.00, 0.00, 0.00, 15000.00, 7000.00, 8000.00, '2026-09-14'),
('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 'INV-105', 'PARTIALLY_PAID', 35000.00, 0.00, 0.00, 35000.00, 15000.00, 20000.00, '2026-09-28'),
('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', NULL, 'INV-103', 'PAID', 22000.00, 0.00, 0.00, 22000.00, 22000.00, 0.00, '2026-09-16'),
('10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000004', NULL, 'INV-102', 'PAID', 18000.00, 0.00, 0.00, 18000.00, 18000.00, 0.00, '2026-09-12');

-- 8. Payments
INSERT INTO public.payments (id, business_id, invoice_id, client_id, amount, payment_date, payment_method, reference, notes) VALUES
('20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 7000.00, '2026-09-16', 'UPI', 'UPI/260916/8839201', '50% Booking advance received via GPay'),
('20000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 15000.00, '2026-09-17', 'BANK_TRANSFER', 'NEFT/HDFC/992011', 'Project mobilization advance'),
('20000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 22000.00, '2026-09-16', 'UPI', 'UPI/260916/5544332', 'Full payment for M4 Track Day Reel'),
('20000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005', 18000.00, '2026-09-12', 'BANK_TRANSFER', 'IMPS/T&T/882190', 'Settled on final drive delivery');

-- 9. Expenses
INSERT INTO public.expenses (id, business_id, project_id, category, amount, expense_date, description) VALUES
('30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Fuel', 1400.00, '2026-09-16', 'Travel to DLF Gurgaon showroom for recce & delivery'),
('30000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Assistant', 3500.00, '2026-09-17', 'Gimbal & 2nd camera assistant crew fee'),
('30000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'Equipment', 4000.00, '2026-09-15', 'Sony FX3 24-70mm GM II lens rental & polarizer');

-- 10. Deliverables
INSERT INTO public.deliverables (id, business_id, project_id, name, type, status, preview_url, file_url, notes) VALUES
('40000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'BMW X5 4K Cinematic Cut (V1)', 'Video', 'READY_FOR_REVIEW', 'https://assets.mixkit.co/videos/preview/mixkit-black-luxury-car-driving-in-the-city-at-night-42289-large.mp4', 'https://icontejas.com/delivery/bmw-x5-v1.mov', 'Grade: Teal & Orange cinematic automotive tone'),
('40000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Instagram Reel 9:16 Handover', 'Reel', 'READY_FOR_REVIEW', 'https://assets.mixkit.co/videos/preview/mixkit-car-traveling-on-a-road-in-nature-42294-large.mp4', 'https://icontejas.com/delivery/bmw-x5-reel.mp4', 'Optimized for mobile audio trending beats'),
('40000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'BMW M4 Track Master 4K', 'Video', 'APPROVED', 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-sports-car-driving-on-a-curvy-road-42291-large.mp4', 'https://icontejas.com/delivery/bmw-m4-master.mov', 'Final client approved cut');

-- 11. Follow-ups
INSERT INTO public.followups (id, business_id, client_id, quotation_id, invoice_id, scheduled_for, type, status, message) VALUES
('50000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NULL, '10000000-0000-0000-0000-000000000001', '2026-09-18', 'PAYMENT', 'PENDING', 'Hey Rahul, just a quick reminder regarding the pending ₹8,000 balance for the BMW X5 shoot. Whenever convenient, please have a look. Thanks!'),
('50000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000003', NULL, '2026-09-18', 'QUOTATION', 'PENDING', 'Hey Aman, just following up on the quotation I shared for the Porsche 911 delivery shoot. Let me know if you would like to proceed or make any tweaks!');

-- 12. Notifications
INSERT INTO public.notifications (id, business_id, type, title, description, reference_id, read) VALUES
('60000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'payment_overdue', 'Payment Overdue', 'Rahul Sharma has an overdue balance of ₹8,000 on INV-104 (4 days overdue)', '10000000-0000-0000-0000-000000000001', FALSE),
('60000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'shoot_tomorrow', 'Shoot Tomorrow', 'BMW X5 Delivery Shoot with Rahul Sharma at 11:30 AM in Gurgaon', 'e0000000-0000-0000-0000-000000000001', FALSE),
('60000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'quotation_pending', 'Quotation Waiting', 'Quotation QT-106 for Aman Verma (₹25,000) waiting for response (3 days)', 'f0000000-0000-0000-0000-000000000003', FALSE);

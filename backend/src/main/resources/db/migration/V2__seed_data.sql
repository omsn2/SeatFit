-- V2__seed_data.sql
-- Development seed: one centre, two shifts, pricing plans, 40 seats, two users

DO $$
DECLARE
    v_centre_id   UUID := gen_random_uuid();
    v_morning_id  UUID := gen_random_uuid();
    v_evening_id  UUID := gen_random_uuid();
    v_admin_id    UUID := gen_random_uuid();
    v_member_id   UUID := gen_random_uuid();
    r             INTEGER;
    c             INTEGER;
    row_letter    TEXT;
BEGIN

-- Centre
INSERT INTO centres (id, name, address, city, total_seats, open_time, close_time, amenities, photos)
VALUES (
    v_centre_id,
    'StudyHub Koramangala',
    '5th Block, Koramangala, Bengaluru — 560034',
    'Bengaluru',
    40,
    '06:00:00', '22:00:00',
    '["AC","WiFi","Printing","Lockers","Charging Points","CCTV","Drinking Water"]',
    '[{"url":"https://placehold.co/800x500?text=StudyHub+Entrance","caption":"Entrance","is_primary":true}]'
);

-- Shifts
INSERT INTO shifts (id, centre_id, name, start_time, end_time, shift_type)
VALUES
    (v_morning_id, v_centre_id, 'Morning', '06:00:00', '14:00:00', 'morning'),
    (v_evening_id, v_centre_id, 'Evening', '14:00:00', '22:00:00', 'evening');

-- Pricing plans
INSERT INTO pricing_plans (centre_id, name, plan_type, price)
VALUES
    (v_centre_id, 'Single Shift', 'per_shift', 60.00),
    (v_centre_id, 'Full Day',     'daily',     100.00),
    (v_centre_id, 'Monthly',      'monthly',   1200.00);

-- 40 seats — 4 rows (A-D) × 10 columns
FOR r IN 1..4 LOOP
    row_letter := CHR(64 + r);  -- A, B, C, D
    FOR c IN 1..10 LOOP
        INSERT INTO seats (centre_id, label, seat_type, status, row_number, col_number)
        VALUES (
            v_centre_id,
            row_letter || c::TEXT,
            CASE WHEN c = 1 OR c = 10 THEN 'window' ELSE 'standard' END,
            'available',
            r,
            c
        );
    END LOOP;
END LOOP;

-- Admin user
INSERT INTO users (id, name, phone, email, role, centre_id)
VALUES (v_admin_id, 'Admin User', '+919999000001', 'admin@studyhub.in', 'centre_admin', v_centre_id);

-- Member user
INSERT INTO users (id, name, phone, email, role)
VALUES (v_member_id, 'Test Student', '+919999000002', 'student@example.com', 'member');

END $$;

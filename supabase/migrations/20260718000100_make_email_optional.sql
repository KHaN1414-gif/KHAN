-- Email is now optional on bookings (phone remains the required contact method,
-- since it's the channel patients actually check). Drop the NOT NULL constraint.
ALTER TABLE public.appointments ALTER COLUMN email DROP NOT NULL;

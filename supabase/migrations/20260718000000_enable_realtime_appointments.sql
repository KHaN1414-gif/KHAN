-- Enable Realtime change events on appointments so a customer's open booking
-- confirmation screen can hear about status changes (e.g. staff confirming it)
-- without needing to refresh.
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

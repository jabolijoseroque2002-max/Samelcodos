-- Migration: Create contact_messages table to store "Message Us" form submissions
-- Description: Stores messages submitted through the Contact page form.

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    account_number VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert messages
CREATE POLICY "Allow anon insert to contact_messages"
ON public.contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Allow only authenticated users to read messages
CREATE POLICY "Allow authenticated read contact_messages"
ON public.contact_messages FOR SELECT
TO authenticated
USING (true);

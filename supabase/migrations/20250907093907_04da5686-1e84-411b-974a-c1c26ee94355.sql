-- Fix critical security vulnerability: Customer data exposed to public

-- BOOKINGS TABLE SECURITY FIX
DROP POLICY IF EXISTS "Allow public read access to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public insert to bookings" ON bookings;

-- Create secure policies for bookings
CREATE POLICY "Allow public insert only for bookings"
ON bookings FOR INSERT
WITH CHECK (true);  -- Allow form submissions

CREATE POLICY "Block public read access to bookings"
ON bookings FOR SELECT
USING (false);  -- Block all public reads

-- QUOTES TABLE SECURITY FIX
DROP POLICY IF EXISTS "Allow public read access to quotes" ON quotes;
DROP POLICY IF EXISTS "Allow public insert to quotes" ON quotes;

-- Create secure policies for quotes
CREATE POLICY "Allow public insert only for quotes"
ON quotes FOR INSERT
WITH CHECK (true);  -- Allow form submissions

CREATE POLICY "Block public read access to quotes"
ON quotes FOR SELECT
USING (false);  -- Block all public reads

-- CONTACTS TABLE SECURITY FIX
DROP POLICY IF EXISTS "Allow public read access to contacts" ON contacts;
DROP POLICY IF EXISTS "Allow public insert to contacts" ON contacts;

-- Create secure policies for contacts
CREATE POLICY "Allow public insert only for contacts"
ON contacts FOR INSERT
WITH CHECK (true);  -- Allow form submissions

CREATE POLICY "Block public read access to contacts"
ON contacts FOR SELECT
USING (false);  -- Block all public reads
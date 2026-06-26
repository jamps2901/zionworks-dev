-- Fix critical security vulnerability in blog_posts table

-- Drop the overly permissive policy that allows all authenticated users full access
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON blog_posts;

-- Create secure policies for blog_posts

-- Allow public to READ published blog posts (for website visitors)
CREATE POLICY "Allow public read access to blog posts"
ON blog_posts FOR SELECT
USING (true);

-- Block all public write operations (only admins should manage blog content)
CREATE POLICY "Block public insert on blog posts"
ON blog_posts FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block public update on blog posts"
ON blog_posts FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "Block public delete on blog posts"
ON blog_posts FOR DELETE
USING (false);
-- Create secure functions for admin blog management
-- These functions use SECURITY DEFINER to bypass RLS for authorized admin access

-- Function to get all blog posts for admin management
CREATE OR REPLACE FUNCTION get_admin_blog_posts()
RETURNS TABLE (
  id bigint,
  created_at timestamptz,
  title text,
  content text,
  tags varchar,
  image_url text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, created_at, title, content, tags, image_url
  FROM blog_posts
  ORDER BY created_at DESC;
$$;

-- Function to create a new blog post (admin only)
CREATE OR REPLACE FUNCTION create_admin_blog_post(
  p_title text,
  p_content text,
  p_tags varchar DEFAULT '',
  p_image_url text DEFAULT ''
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_post_id bigint;
BEGIN
  INSERT INTO blog_posts (title, content, tags, image_url)
  VALUES (p_title, p_content, p_tags, p_image_url)
  RETURNING id INTO new_post_id;
  
  RETURN new_post_id;
END;
$$;

-- Function to update a blog post (admin only)
CREATE OR REPLACE FUNCTION update_admin_blog_post(
  p_id bigint,
  p_title text,
  p_content text,
  p_tags varchar DEFAULT '',
  p_image_url text DEFAULT ''
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE blog_posts
  SET 
    title = p_title,
    content = p_content,
    tags = p_tags,
    image_url = p_image_url
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$;

-- Function to delete a blog post (admin only)
CREATE OR REPLACE FUNCTION delete_admin_blog_post(p_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM blog_posts WHERE id = p_id;
  RETURN FOUND;
END;
$$;
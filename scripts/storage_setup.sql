-- Create a public bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the avatars bucket

-- Drop existing policies to ensure a clean setup
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar." ON storage.objects;

-- Policy for public access to view avatars
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Policy for authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar." ON storage.objects
  FOR INSERT WITH CHECK (auth.uid() = owner AND bucket_id = 'avatars');

-- Policy for authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar." ON storage.objects
  FOR UPDATE USING (auth.uid() = owner AND bucket_id = 'avatars');

-- Policy for authenticated users to delete their own avatar
CREATE POLICY "Users can delete their own avatar." ON storage.objects
  FOR DELETE USING (auth.uid() = owner AND bucket_id = 'avatars');

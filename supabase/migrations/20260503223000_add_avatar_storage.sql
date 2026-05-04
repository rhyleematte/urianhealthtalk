-- 1. Add avatar_url column to your profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Allow anyone to view avatars
CREATE POLICY "Avatar images are publicly accessible." 
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- 3. Allow logged-in users to upload their own avatars
CREATE POLICY "Users can upload their own avatar." 
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid() = owner
);

-- 4. Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar." 
ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid() = owner
);

-- 5. Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar." 
ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid() = owner
);

-- ============================================================
-- Supabase Storage Policies for the 'photos' bucket
-- ============================================================
-- These policies restrict uploads server-side so that even if
-- client-side validation is bypassed, only allowed file types
-- and sizes can be stored.
--
-- HOW TO APPLY:
-- 1. Go to your Supabase Dashboard → SQL Editor
-- 2. Paste and run this entire file
-- 3. Verify in Storage → Policies that the new policies appear
-- ============================================================

-- Ensure the 'photos' bucket exists and is public (for read access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DROP existing permissive policies (if any) to replace them
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Restrict uploads by type and size" ON storage.objects;

-- ============================================================
-- POLICY: Public read access to the photos bucket
-- ============================================================
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'photos');

-- ============================================================
-- POLICY: Restrict uploads by MIME type, file size, and path
-- ============================================================
-- Only authenticated users can upload.
-- Files must:
--   - Be in a path prefixed with the user's own ID (e.g., "<user_id>/...")
--   - Have an allowed MIME type (images or audio)
--   - Be under 15MB (covers both image 10MB and audio 15MB limits)
-- ============================================================
CREATE POLICY "Restrict uploads by type and size"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    -- Allowed image MIME types
    (metadata->>'mimetype') IN (
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif'
    )
    OR
    -- Allowed audio MIME types
    (metadata->>'mimetype') IN (
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/ogg',
      'audio/flac',
      'audio/aac',
      'audio/mp4',
      'audio/x-m4a',
      'audio/webm'
    )
  )
  AND (metadata->>'size')::int <= 15728640  -- 15MB in bytes
);

-- ============================================================
-- POLICY: Users can only delete their own files
-- ============================================================
CREATE POLICY "Allow owner delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- POLICY: Users can update (overwrite) their own files only
-- ============================================================
CREATE POLICY "Allow owner update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    (metadata->>'mimetype') IN (
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav',
      'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4', 'audio/x-m4a', 'audio/webm'
    )
  )
  AND (metadata->>'size')::int <= 15728640
);

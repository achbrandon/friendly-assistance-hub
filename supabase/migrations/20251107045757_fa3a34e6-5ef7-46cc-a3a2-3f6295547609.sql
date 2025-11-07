-- Create storage bucket for support attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for support attachments
CREATE POLICY "Users can upload support attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'support-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own support attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'support-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all support attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'support-attachments' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Public can view support attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'support-attachments');
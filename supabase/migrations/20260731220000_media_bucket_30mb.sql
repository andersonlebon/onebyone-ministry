-- Allow larger admin photo uploads (phone camera originals).
update storage.buckets
set file_size_limit = 31457280 -- 30 MB
where id = 'media';

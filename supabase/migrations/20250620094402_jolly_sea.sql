/*
  # Add foreign key constraint for reviews-profiles relationship

  1. Changes
    - Add foreign key constraint between reviews.user_id and profiles.id
    - This enables the join operation in the reviews query

  2. Security
    - No changes to existing RLS policies
    - Maintains data integrity with CASCADE delete
*/

-- Add foreign key constraint between reviews.user_id and profiles.id
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;
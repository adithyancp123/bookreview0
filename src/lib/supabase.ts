import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Avoid crashing the app during local development if env vars are missing.
// We warn and use harmless fallbacks so the UI can still render.
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars are missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). The app will run, but data fetching will be disabled until you configure them.'
  );
}
const effectiveUrl = supabaseUrl || 'https://example.supabase.co';
const effectiveKey = supabaseAnonKey || 'public-anon-key';

export const supabase = createClient(effectiveUrl, effectiveKey);

export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          isbn: string;
          description: string;
          genre: string;
          publication_date: string;
          cover_image: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          isbn: string;
          description: string;
          genre: string;
          publication_date: string;
          cover_image: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          isbn?: string;
          description?: string;
          genre?: string;
          publication_date?: string;
          cover_image?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          book_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
-- Create the journal_entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  category TEXT DEFAULT 'Personal',
  date_string TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Users can view own entries" ON public.journal_entries;
CREATE POLICY "Users can view own entries" 
ON public.journal_entries FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own entries" ON public.journal_entries;
CREATE POLICY "Users can insert own entries" 
ON public.journal_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own entries" ON public.journal_entries;
CREATE POLICY "Users can update own entries" 
ON public.journal_entries FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own entries" ON public.journal_entries;
CREATE POLICY "Users can delete own entries" 
ON public.journal_entries FOR DELETE 
USING (auth.uid() = user_id);

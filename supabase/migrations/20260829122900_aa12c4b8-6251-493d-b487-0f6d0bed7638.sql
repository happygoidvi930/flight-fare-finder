CREATE TABLE public.watches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_code TEXT NOT NULL,
  destination_city_zh TEXT NOT NULL,
  destination_city_en TEXT NOT NULL,
  target_price_twd INTEGER NOT NULL CHECK (target_price_twd > 0),
  current_low_twd INTEGER,
  previous_low_twd INTEGER,
  status TEXT NOT NULL DEFAULT 'watching' CHECK (status IN ('watching', 'hit', 'sent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watches TO authenticated;
GRANT ALL ON public.watches TO service_role;
ALTER TABLE public.watches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own watches" ON public.watches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX watches_user_id_idx ON public.watches (user_id);

-- 1. Hostels table
CREATE TABLE public.hostels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,  -- short code like 'BH1', 'GH2'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view hostels" ON public.hostels FOR SELECT USING (true);

-- 2. Add hostel_id to profiles
ALTER TABLE public.profiles ADD COLUMN hostel_id UUID REFERENCES public.hostels(id);

-- 3. Allowed emails table (pre-approved signups)
CREATE TABLE public.allowed_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email)
);
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;
-- Only admins can manage allowed emails
CREATE POLICY "Admins can manage allowed_emails" ON public.allowed_emails FOR ALL USING (public.has_role(auth.uid(), 'admin'));
-- Allow unauthenticated reads for signup validation (via edge function instead)

-- 4. Blocked users table
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  blocked_by UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, hostel_id)
);
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "MHMC/Admin can manage blocks" ON public.blocked_users FOR ALL USING (
  public.has_role(auth.uid(), 'mhmc') OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can view own blocks" ON public.blocked_users FOR SELECT USING (auth.uid() = user_id);

-- 5. Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- Students can view notifications for their hostel
CREATE POLICY "Users can view own hostel notifications" ON public.notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND hostel_id = notifications.hostel_id)
);
CREATE POLICY "MHMC/Admin can create notifications" ON public.notifications FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'mhmc') OR public.has_role(auth.uid(), 'admin')
);

-- 6. User notification reads (track which notifications user has seen)
CREATE TABLE public.notification_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reads" ON public.notification_reads FOR ALL USING (auth.uid() = user_id);

-- 7. Add hostel_id to forum_posts for hostel scoping
ALTER TABLE public.forum_posts ADD COLUMN hostel_id UUID REFERENCES public.hostels(id);

-- 8. Security definer function to check if user is blocked
CREATE OR REPLACE FUNCTION public.is_blocked(_user_id UUID, _hostel_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE user_id = _user_id AND hostel_id = _hostel_id
  )
$$;

-- 9. Security definer function to get user's hostel
CREATE OR REPLACE FUNCTION public.get_user_hostel(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT hostel_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- 10. Update forum_posts RLS: only same-hostel users can view/create, and not blocked
DROP POLICY IF EXISTS "Everyone can view posts" ON public.forum_posts;
CREATE POLICY "Same hostel can view posts" ON public.forum_posts FOR SELECT USING (
  hostel_id = public.get_user_hostel(auth.uid()) OR hostel_id IS NULL
);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
CREATE POLICY "Same hostel non-blocked users can create posts" ON public.forum_posts FOR INSERT WITH CHECK (
  auth.uid() = author_id
  AND hostel_id = public.get_user_hostel(auth.uid())
  AND NOT public.is_blocked(auth.uid(), hostel_id)
);

-- 11. Update forum_comments RLS: only for posts in user's hostel, not blocked
DROP POLICY IF EXISTS "Everyone can view comments" ON public.forum_comments;
CREATE POLICY "Same hostel can view comments" ON public.forum_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.forum_posts fp
    WHERE fp.id = forum_comments.post_id
    AND (fp.hostel_id = public.get_user_hostel(auth.uid()) OR fp.hostel_id IS NULL)
  )
);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.forum_comments;
CREATE POLICY "Same hostel non-blocked users can create comments" ON public.forum_comments FOR INSERT WITH CHECK (
  auth.uid() = author_id
  AND EXISTS (
    SELECT 1 FROM public.forum_posts fp
    WHERE fp.id = forum_comments.post_id
    AND fp.hostel_id = public.get_user_hostel(auth.uid())
    AND NOT public.is_blocked(auth.uid(), fp.hostel_id)
  )
);

-- 12. Update handle_new_user to assign hostel from allowed_emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _hostel_id UUID;
  _role app_role;
BEGIN
  -- Look up pre-approved email
  SELECT hostel_id, role INTO _hostel_id, _role
  FROM public.allowed_emails
  WHERE email = NEW.email;

  INSERT INTO public.profiles (user_id, full_name, hostel_id)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), _hostel_id);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(_role, 'student'));

  RETURN NEW;
END;
$$;

-- 13. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

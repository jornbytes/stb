import { useEffect } from 'react';
import { supabase } from './supabase';

function getSessionId(): string {
  const key = 'pv_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

export function usePageView(title: string) {
  useEffect(() => {
    const path = window.location.pathname;
    const referrer = document.referrer || null;
    const user_agent = navigator.userAgent || null;
    const session_id = getSessionId();

    supabase.from('page_views').insert({
      path,
      page_title: title,
      referrer,
      user_agent,
      session_id,
    });
  }, [title]);
}

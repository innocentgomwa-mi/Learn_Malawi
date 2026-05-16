import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { logActivity } from '@/api';

export function usePageLogger(action = 'page_viewed', meta = {}) {
  const { user } = useAuth();
  const location = useLocation();
  const metaString = useMemo(() => JSON.stringify(meta), [meta]);

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    const userName = user.full_name || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email;

    logActivity({
      action,
      user_email: user.email,
      user_name: userName,
      user_role: user.role || 'student',
      resource_title: location.pathname,
      ...meta,
    }).catch(() => {});
  }, [action, location.pathname, metaString, user?.email, user?.full_name, user?.firstName, user?.lastName, user?.role]);
}

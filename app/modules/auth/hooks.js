import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { showAuth } from 'modules/navigation/navigation.actions';

export function useAuth() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  if (!isAuthenticated);
  return useCallback(() => {
    if (isAuthenticated) return true;
    dispatch(showAuth());
    return false;
  }, [isAuthenticated, dispatch]);
}

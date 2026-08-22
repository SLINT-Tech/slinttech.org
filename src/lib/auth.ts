import type { NavigateFunction } from 'react-router-dom';

export const clearAuthData = () => {
  try {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');

    sessionStorage.clear();

    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
    });

    console.log('Successfully cleared all authentication data');
  } catch (error) {
    console.error('Error clearing auth data:', error);
    localStorage.clear();
    sessionStorage.clear();
  }
};

export const logout = (navigate: NavigateFunction, redirectTo: string = '/login') => {
  clearAuthData();
  navigate(redirectTo, { replace: true });
};

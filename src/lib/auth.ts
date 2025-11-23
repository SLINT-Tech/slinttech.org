export const logout = (redirectTo: string = '/login') => {
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
    
    console.log('Successfully logged out and cleared all authentication data');
    
    window.location.href = redirectTo;
  } catch (error) {
    console.error('Error during logout:', error);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = redirectTo;
  }
};

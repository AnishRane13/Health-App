const PORTAL_KEY = 'wellpath_last_portal';

export function setLastPortal(portal) {
  if (portal === 'admin' || portal === 'patient') {
    localStorage.setItem(PORTAL_KEY, portal);
  }
}

export function getLastPortal() {
  return localStorage.getItem(PORTAL_KEY) === 'admin' ? 'admin' : 'patient';
}

export function loginPathForRole(role) {
  return `/login?portal=${role === 'ADMIN' ? 'admin' : 'patient'}`;
}

export function loginPathForPortal(portal) {
  return `/login?portal=${portal === 'admin' ? 'admin' : 'patient'}`;
}

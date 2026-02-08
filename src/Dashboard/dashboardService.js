const STORAGE_KEY_USER = 'userData';
const STORAGE_KEY_MODULES_PREFIX = 'userModules_';

export const DEFAULT_MODULES = [
  { code: 'HMU08001', name: 'Innovation Management', status: 'Start', progress: 0, route: '/modules/hmu08001' },
  { code: 'HMU08002', name: 'Intellectual Property (IP) Management', status: 'Start', progress: 0, route: '/modules/hmu08002' },
  { code: 'HMU08003', name: 'Research Commercialization', status: 'Finished', progress: 100, route: '/modules/hmu08003' },
  { code: 'HMU08004', name: 'Fundraising and Sustainable Hub Operations', status: 'Finished', progress: 100, route: '/modules/hmu08004' }
];

export const getUserData = () => {
  const userData = localStorage.getItem(STORAGE_KEY_USER);
  return userData ? JSON.parse(userData) : null;
};

export const setUserData = (userData) => {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
};

export const clearUserData = () => {
  localStorage.removeItem(STORAGE_KEY_USER);
};

export const getModulesForUser = (userId) => {
  if (!userId) return [];
  const key = `${STORAGE_KEY_MODULES_PREFIX}${userId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (_) {
      return [...DEFAULT_MODULES];
    }
  }
  localStorage.setItem(key, JSON.stringify(DEFAULT_MODULES));
  return [...DEFAULT_MODULES];
};

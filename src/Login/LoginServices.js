import { auth } from '../api/api';

export const loginUser = async (credentials) => {
  const { data } = await auth.login(credentials);
  const ok = data?.status === 'OK';
  const accessToken = data?.returnData?.access_token;
  const message = data?.errorMessage || (ok ? 'Login successful' : 'Invalid credentials');

  if (ok && accessToken) {
    const name = credentials.email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const id = Math.abs(
      credentials.email.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    );
    const userData = {
      id,
      name: name.trim() || credentials.email,
      email: credentials.email,
      access_token: accessToken
    };
    return { success: true, message, data: userData };
  }

  return { success: false, message, data: null };
};

import { users } from '../api/api';

export const registerUser = async (userData) => {
  const { data } = await users.register({
    form_method: 'save',
    name: userData.name,
    email: userData.email,
    password: userData.password,
    phone: userData.phone,
    role: 'User'
  });

  const ok = data?.status === 'OK';
  const message = data?.errorMessage || (ok ? 'User registered successfully' : 'Registration failed');

  if (ok) {
    return { success: true, message, data: data?.returnData ?? userData };
  }

  return { success: false, message, data: null };
};

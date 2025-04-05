
import apiClient from './apiClient';

export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: any; token: string }> => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    localStorage.setItem('authToken', response.data.data.accessToken);

    return {
      user: {
        id: response.data.data.id,
        username: response.data.data.userName || response.data.data.username,
        email: response.data.data.email,
        tasks: [],
      },
      token: response.data.data.accessToken,
    };
  } catch (error: any) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<{ user: any; token: string }> => {
  try {
    const response = await apiClient.post('/auth/register', {
      username,
      email,
      password,
    });

    if (response.data.data.accessToken) {
      localStorage.setItem('authToken', response.data.data.accessToken);
    }

    return {
      user: {
        id: response.data.data.id,
        username: response.data.data.userName || username,
        email: response.data.data.email,
        tasks: [],
      },
      token: response.data.data.accessToken || '',
    };
  } catch (error: any) {
    console.error('Registration failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

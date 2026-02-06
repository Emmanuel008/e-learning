
export const getUserData = () => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
};

export const setUserData = (userData) => {
    // Store user data in localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
};

export const clearUserData = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userData');
};

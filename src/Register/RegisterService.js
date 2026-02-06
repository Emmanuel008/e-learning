
export const registerUser = async (userData) => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: 'User registered successfully', data: userData });
        }, 1000);
    });
};

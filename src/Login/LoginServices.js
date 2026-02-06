
export const loginUser = async (credentials) => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            if (credentials.email && credentials.password) {
                // Simulate user data - in real app, this would come from API
                const userData = {
                    id: Math.floor(Math.random() * 9000000) + 1000000, // Generate random ID between 1000000-9999999
                    name: credentials.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    email: credentials.email,
                    token: 'fake-jwt-token'
                };
                resolve({ success: true, message: 'Login successful', data: userData });
            } else {
                resolve({ success: false, message: 'Invalid credentials' });
            }
        }, 1000);
    });
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Input from '../components/Input';
import { loginUser } from './LoginServices';
import { setUserData } from '../Dashboard/dashboardService';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await loginUser(formData);

            if (response.success) {
                if (response.data) {
                    setUserData(response.data);
                    setUser(response.data);
                }
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Login successful!',
                    confirmButtonColor: '#2563eb',
                    timer: 2000,
                    showConfirmButton: true,
                    width: 300,
                    customClass: {
                        popup: 'swal2-small',
                        title: 'swal2-title-small',
                        content: 'swal2-content-small'
                    }
                });
                // Redirect to dashboard
                navigate('/dashboard');
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: response.message || 'Invalid credentials. Please try again.',
                    confirmButtonColor: '#2563eb',
                    width: 300,
                    customClass: {
                        popup: 'swal2-small',
                        title: 'swal2-title-small',
                        content: 'swal2-content-small'
                    }
                });
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred during login. Please try again.',
                confirmButtonColor: '#2563eb',
                width: 300,
                customClass: {
                    popup: 'swal2-small',
                    title: 'swal2-title-small',
                    content: 'swal2-content-small'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
                <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    className="login-btn" 
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Logging in...
                        </>
                    ) : (
                        'Login'
                    )}
                </button>
            </form>
        </div>
    );
};

export default Login;

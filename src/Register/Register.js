
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Input from '../components/Input';
import { registerUser } from './RegisterService';
import './Register.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
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
            const response = await registerUser(formData);
            console.log('Registration successful:', response);
            
            if (response.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful!',
                    text: 'Your account has been created successfully. Redirecting to login...',
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
                navigate('/login');
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: response.message || 'Registration failed. Please try again.',
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
            console.error('Registration failed:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred during registration. Please try again.',
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
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <Input
                    label="Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
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
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
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
                    className="register-btn"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Registering...
                        </>
                    ) : (
                        'Register'
                    )}
                </button>
            </form>
        </div>
    );
};

export default RegisterPage;

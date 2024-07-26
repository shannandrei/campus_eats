import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from './axiosConfig';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('currentUser');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/users/authenticate', { usernameOrEmail: email, password });

            if (!response.data) {
                throw new Error('Login failed');
            }

            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            setCurrentUser(response.data.user);
            console.log('Login successful', response.data);
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };
    

    const signup = async (email, password, username, firstname, lastname) => {
        try {
            const response = await axios.post('/users/signup', { email, password, username, firstname, lastname });

            if (!response.data) {
                throw new Error('Signup failed');
            }

            console.log('Signup successful', response.data);
            navigate("/login");
        } catch (error) {
            console.error('Signup failed', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        navigate('/login');
    };

    const updatePassword = async (userId, oldPassword, newPassword) => {
        try {
            await axios.put(`/users/${userId}/updatePassword`, { oldPassword, newPassword });
            console.log('Password updated successfully');
        } catch (error) {
            console.error('Error updating password', error);
            throw error;
        }
    };

    const value = {
        currentUser,
        login,
        logout,
        signup,
        updatePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext };

import React, {createContext, useContext, useState, useEffect} from "react";

import { useNavigate } from "react-router-dom";

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
            const response = await fetch('http://localhost:8080/api/users/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail: email, password })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }
    
            const data = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            setCurrentUser(data.user); // This should update context
            console.log('Login successful', data);
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };
    
    

    const signup = async (email, password, username, firstName, lastName) => {
        // Call your signup API here
        try {
            const response = await fetch('http://localhost:8080/api/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username, firstName, lastName })
            });
            const data = await response.json();
            // handle post-registration steps, e.g., navigate to login or home
            navigate('/login');
        } catch (error) {
            console.error('Signup failed', error);
        }
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        navigate('/login');
    };

    const value = {
        currentUser,
        login,
        logout, 
        signup
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext };
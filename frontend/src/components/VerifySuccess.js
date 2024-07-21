import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VerifySuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to a specific page (e.g., login or home) after a short delay
        const timer = setTimeout(() => {
            navigate('/login'); // Redirect to login or another route
        }, 3000); // Redirect after 3 seconds

        return () => clearTimeout(timer); // Cleanup the timer
    }, [navigate]);

    return (
        <div>
            <h1>Email Verified Successfully!</h1>
            <p>You will be redirected shortly...</p>
        </div>
    );
};

export default VerifySuccess;

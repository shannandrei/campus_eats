import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/users'; // Update with your backend URL

const signup = async (user) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/signup`, user);
        return response.data;
    } catch (error) {
        console.error("Error during signup:", error);
        throw error.response ? error.response.data : error;
    }
};

const login = async (usernameOrEmail, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/authenticate`, {
            usernameOrEmail,
            password
        });
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error.response ? error.response.data : error;
    }
};

export { signup, login };

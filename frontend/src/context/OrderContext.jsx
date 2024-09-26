import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from './axiosConfig';
import { useAuth } from '../utils/AuthContext';

const OrderContext = createContext();

export function useOrderContext() {
    return useContext(OrderContext);
}

export function OrderContext({ children }) {
    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (currentUser) {
            const fetchCartData = async () => {
                try {
                    const response = await api.get(`/carts/cart?uid=${currentUser.id}`);
                    // Directly access response.data with axios
                    const data = response.data;
                    setCartData(data);
                } catch (error) {
                    console.error('Error fetching cart data:', error);
                }
            };
            fetchCartData();
        }
    }, [currentUser]);

    const value = {
        
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
}

export { OrderContext };

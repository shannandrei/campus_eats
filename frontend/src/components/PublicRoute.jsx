import React from "react";
// import { Route, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { useEffect } from "react";
import Home from "./Home";
import axios from '../utils/axiosConfig';
import DasherHome from "./DasherHome";
import ShopManage from "./ShopManage";

const PublicRoute = ({Component}) => {
    const {currentUser} = useAuth();
    const [accountType, setAccountType] = React.useState('');
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        console.log("admin route current user: ", currentUser);
        setLoading(true);
        if (currentUser) {
            const fetchUserAccountType = async () => {
                try {
                    const response = await axios.get(`/users/${currentUser.id}/accountType`);
                    setAccountType(response.data); 
                    console.log("admin route account type: ", response.data);
                    // Directly setting the response data since it's a plain string
                } catch (error) {
                    console.error('Error fetching user account type:', error);
                }
            };
        
            fetchUserAccountType();
        }
        setLoading(false);
        
    }, [currentUser]);
    // const navigate = useNavigate();
    if (accountType === 'admin') {
        return <Component />;
    }

    if(accountType === 'dasher'){
        return <DasherHome />;
    }
    
    if (accountType === 'shop') {
        return <ShopManage />;
    }
    return currentUser ? <Home /> : <Component/>
}

export default PublicRoute;
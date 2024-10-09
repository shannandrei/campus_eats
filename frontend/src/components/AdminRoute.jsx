import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import axios from '../utils/axiosConfig';
import DasherHome from "./DasherHome";
import Home from "./Home";
import LoginSignUp from "./LoginSignUp";
import ShopManage from "./ShopManage";

const AdminRoute = ({ Component }) => {
  const { currentUser } = useAuth();
  const [accountType, setAccountType] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Checking permissions...</div>; // Or a loading spinner
  }

  if (!currentUser) {
    return <LoginSignUp />;
  }

  if (accountType === 'admin') {
    return <Component />;
  }

  if(accountType === 'dasher'){
    return <DasherHome />;
  }

  if (accountType === 'shop') {
    return <ShopManage />;
  }
  return <Home />;
};

export default AdminRoute;

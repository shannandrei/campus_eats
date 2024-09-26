import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import LoginSignUp from "./LoginSignUp";
import Home from "./Home";
import ShopManage from "./ShopManage";
import axios from '../utils/axiosConfig';

const DasherRoute = ({ Component }) => {
  const { currentUser } = useAuth();
  const [accountType, setAccountType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (accountType === 'shop') {
    return <ShopManage />;
  }

  if (accountType === 'regular') {
    return <Home />;
  }

  if (accountType === 'dasher' || accountType === 'admin') {
    return <Component />;
  }



  return <Home />;
};

export default DasherRoute;

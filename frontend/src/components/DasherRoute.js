import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginSignUp from "./LoginSignUp";
import Home from "./Home";
import axios from 'axios';
import LandingPage from "./LandingPage";
import AdminDashboard from "./AdminDashboard";
import ShopManage from "./ShopManage";

const DasherRoute = ({ Component }) => {
  const { currentUser } = useAuth();
  const [accountType, setAccountType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const fetchUserRole = async () => {
        try {
            console.log("currentasdfasdfsdfdfffffffffffffffff: ", currentUser.id);
            const response = await api.get(`/users/${currentUser.id}/accountType`);
            setAccountType(response.data); 
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching user account type:', error);
        }
    };
      
      fetchUserRole();
    } else {
      setLoading(false);
    }
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

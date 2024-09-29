import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import axios from "../utils/axiosConfig";

import "./css/Home.css";

const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [shops, setShops] = useState([]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        } else {
            fetchShops(); // Fetch shops when component mounts
        }
    }, [currentUser]);

    const fetchShops = async () => {
        try {
            const response = await axios.get(`/shops/active`);
            const data = await response.data
            console.log("Fetched shops data:", data); // Log the shops data
            // Fetch ratings for each shop and calculate the average
            const shopsWithRatings = await Promise.all(
                data.map(async (shop) => {
                    const ratingResponse = await axios.get(`/ratings/shop/${shop.id}`); // Assuming this is the API endpoint to get ratings for a shop
                    const ratings = await ratingResponse.data
                    const averageRating = calculateAverageRating(ratings);
                    return { ...shop, averageRating };
                })
            );

            setShops(shopsWithRatings);
            console.log("shops with ratings", shopsWithRatings);
        } catch (error) {
            console.error('Error fetching shops:', error);
        }
    };

    const calculateAverageRating = (ratings) => {
        if (ratings.length === 0) return "No Ratings";
        const total = ratings.reduce((sum, rating) => sum + rating.rate, 0);
        const average = total / ratings.length;
        return average.toFixed(1); // Round to 1 decimal place
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 6) {
            return "Good Midnight";
        } else if (hour < 12) {
            return "Good Morning";
        } else if (hour < 18) {
            return "Good Afternoon";
        } else {
            return "Good Evening";
        }
    };

    const handleCardClick = (shopId) => {
        navigate(`/shop/${shopId}`);
    };

    const renderCategories = (categories) => {
        return categories.map((category, index) => (
            <p className="h-p" key={index}>{category}</p>
        ));
    };

    return (
        <>
            
            <div className="h-body">
                <div className="h-title">
                    <h2>{getGreeting()}, {currentUser?.username}!</h2>
                    <p>Start Simplifying Your Campus Cravings!</p>
                </div>
                <div className="h-content">
                    {shops.map((shop, index) => (
                        <div key={index} className="h-card" onClick={() => handleCardClick(shop.id)}>
                            <div className="h-img">
                                <img src={shop.imageUrl} className="h-image-cover" alt="store" />
                            </div>
                            <div className="h-text">
                                <p className="h-h3">{shop.name}</p>
                                <p className="h-desc">
                                {shop.averageRating && shop.averageRating !== "No Ratings" ? `★ ${shop.averageRating}` : shop.desc}
                                </p>

                                <div className="h-category">
                                    {renderCategories(shop.categories)}
                                </div>
                            </div>
                        </div>  
                    ))}
                </div>
            </div>
        </>
    );
}

export default Home;

import React, { useEffect, useState } from "react";
import "./css/Shop.css";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import Navbar from "./Navbar";
import axios from "../utils/axiosConfig";

const ShopManage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [items, setItems] = useState([]);

    const fetchShop = async () => {
        try {
            const response = await axios.get(`/shops/${currentUser.id}`);
            if (response.status !== 200) {
                throw new Error('Failed to fetch shop');
            }
            setShop(response.data);
            console.log("shop", response.data);
        } catch (error) {
            console.error('Error fetching shop:', error);
        }
    };

    const fetchShopItems = async () => {
        try {
            const response = await axios.get(`/items/${currentUser.id}/shop-items`);
            if (response.status !== 200) {
                throw new Error('Failed to fetch shop items');
            }
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching shop items:', error);
        }
    };

    useEffect(() => {
        // if (!currentUser) {
        //     navigate('/login');
        // } else {
            fetchShop();
            fetchShopItems();
        // }
    }, [currentUser, navigate]);

    if (!shop) {
        return <div>Loading...</div>;
    }

    const renderCategories = (categories) => {
        if (!Array.isArray(categories)) return null;
        return categories.map((category, index) => (
            <h4 key={index}>{category}</h4>
        ));
    };

    if(!currentUser) {
        navigate('/login');
    }

    return (
        <>
            <Navbar />
            <div className="o-body">
                <div className="s-container">
                    <div className="s-title-container">
                        <div className="s-photo">
                            <img src={shop.imageUrl} alt="store" className="s-photo-image" />
                        </div>
                        <div className="s-title">
                            <h2>{shop.name}</h2>
                            <p>{shop.address}</p>
                            <div className="s-title-subtext">
                                <div className="s-shopcat"><h4>Category</h4></div>
                                <div className="s-category">
                                    {renderCategories(shop.categories)}
                                </div>
                                <p>Delivery Fee</p>
                                <h4>₱{shop.deliveryFee}</h4>
                            </div>
                        </div>
                        <div className="sm-plus-icon" onClick={() => navigate(`/shop-update`)}>
                            <FontAwesomeIcon icon={faPen} />
                        </div>
                    </div>
                    <div className="s-items-container">
                        <h2>Items</h2>
                        <div className="s-content">
                            {items.map(item => (
                                <div key={item.id} className="s-card">
                                    <div className="s-img">
                                        <img src={item.imageUrl || '/Assets/Panda.png'} className="s-image-cover" alt="item" />
                                    </div>
                                    <div className="s-text">
                                        <div className="s-subtext">
                                            <p className="s-h3">{item.name}</p>
                                            <p className="s-p">{item.description}</p>
                                        </div>
                                        <h3>₱{item.price.toFixed(2)}</h3>
                                        <div className="s-plus-icon" onClick={() => navigate(`/edit-item/${item.id}`)}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ShopManage;

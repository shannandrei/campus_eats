import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import Navbar from "./Navbar";
import "./css/AdminDasherLists.css";
import AdminAcceptDasherModal from "./AdminAcceptDasherModal";
import axios from "../utils/axiosConfig"; // Use axios from axiosConfig.js

const AdminShopList = () => {
    const { currentUser } = useAuth();
    const [pendingShops, setPendingShops] = useState([]);
    const [currentShops, setCurrentShops] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoogleLink, setSelectedGoogleLink] = useState(null);
    const [selectedShopId, setSelectedShopId] = useState(null);

    const handleDeclineClick = async (shopId) => {
        if (window.confirm("Are you sure you want to decline this shop?")) {
            try {
                await axios.put(`/shops/update/${shopId}/status`, null, { params: { status: 'declined' } });
                // Optionally update the state to remove the declined shop from the list
                setPendingShops(pendingShops.filter(shop => shop.id !== shopId));
            } catch (error) {
                console.error('Error updating shop status:', error);
                alert('Error updating shop status');
            }
        }
    };

    const handleAcceptClick = (googleLink, shopId) => {
        setSelectedShopId(shopId);
        setSelectedGoogleLink(googleLink);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const response = await axios.get('/shops/pending-lists');
                const { pendingShops, nonPendingShops } = response.data;
                setPendingShops(pendingShops);
                setCurrentShops(nonPendingShops);
            } catch (error) {
                console.error('Error fetching shops:', error);
            }
        };

        fetchShops();
    }, []);

    return (
        <>
            <Navbar />

            <div className="adl-body">
                <div className="adl-title">
                    <h2>Pending Shops</h2>
                </div>
                {pendingShops.length > 0 ? (
                    <>
                        <div className="adl-row-container">
                            <div className="adl-word">Name</div>
                            <div className="adl-word">Address</div>
                            <div className="adl-word">Description</div>
                            <div className="adl-word">Categories</div>
                            <div className="adl-word">Shop Open Time</div>
                            <div className="adl-word">Shop Close Time</div>
                            <div className="adl-word">Banner</div>
                            <div className="adl-word">Actions</div>
                        </div>

                        <div className="adl-container">
                            {pendingShops.map(shop => (
                                <div key={shop.id} className="adl-box">
                                    <div className="adl-box-content">
                                        <div>{shop.name}</div>
                                        <div>{shop.address}</div>
                                        <div>{shop.desc}</div>
                                        <div>{shop.categories.join(', ')}</div>
                                        <div>{shop.timeOpen}</div>
                                        <div>{shop.timeClose}</div>
                                        <div>
                                            <img src={shop.imageUrl} alt="shop banner" className="adl-list-pic" />
                                        </div>
                                        <div className="adl-buttons">
                                            <button className="adl-decline" onClick={() => handleDeclineClick(shop.id)}>Decline</button>
                                            <button className="adl-acceptorder" onClick={() => handleAcceptClick(shop.googleLink, shop.id)}>Accept</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div>No pending shops</div>
                )}

                <div className="adl-title">
                    <h2>Shops</h2>
                </div>
                {currentShops.length > 0 ? (
                    <>
                        <div className="adl-row-container">
                            <div className="adl-word">Name</div>
                            <div className="adl-word">Address</div>
                            <div className="adl-word">Description</div>
                            <div className="adl-word">Categories</div>
                            <div className="adl-word">Shop Open Time</div>
                            <div className="adl-word">Shop Close Time</div>
                            <div className="adl-word">Delivery Fee</div>
                            <div className="adl-word">Google Maps</div>
                            <div className="adl-word">Status</div>
                        </div>

                        <div className="adl-container">
                            {currentShops.map(shop => (
                                <div key={shop.id} className="adl-box">
                                    <div className="adl-box-content">
                                        <div>{shop.name}</div>
                                        <div>{shop.address}</div>
                                        <div>{shop.desc}</div>
                                        <div>{shop.categories.join(', ')}</div>
                                        <div>{shop.timeOpen}</div>
                                        <div>{shop.timeClose}</div>
                                        <div>₱{shop.deliveryFee.toFixed(2)}</div>
                                        <div>
                                            <a href={shop.googleLink} target="_blank" rel="noopener noreferrer">Link</a>
                                        </div>
                                        <div>{shop.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div>No current shops</div>
                )}
            </div>
            <AdminAcceptDasherModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} googleLink={selectedGoogleLink} shopId={selectedShopId} />
        </>
    );
};

export default AdminShopList;

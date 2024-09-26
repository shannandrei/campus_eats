import React, { useState } from "react";
import "./css/AdminAcceptDasherModal.css";
import axios from "../utils/axiosConfig"; // Import axiosConfig

const AdminAcceptDasherModal = ({ isOpen, closeModal, googleLink, shopId }) => {
    const [deliveryFee, setDeliveryFee] = useState("");

    if (!isOpen) return null;

    // Convert delivery fee to float and set a limit
    const handleDeliveryFeeChange = (e) => {
        const value = e.target.value;
        if (value === "" || parseFloat(value) >= 0) {
            setDeliveryFee(value);
        }
    };

    const confirmAccept = async () => {
        if (deliveryFee === "") {
            alert("Please enter a delivery fee");
            return;
        }

        try {
            // Update delivery fee
            await axios.put(`/shops/update/${shopId}/deliveryFee`, null, { params: { deliveryFee: parseFloat(deliveryFee) } });

            // Update shop status
            await axios.put(`/shops/update/${shopId}/status`, null, { params: { status: 'active' } });

            // Update account type
            console.log('Updating account type:', shopId);
            await axios.put(`/users/update/${shopId}/accountType`, null, { params: { accountType: 'shop' } });

            alert('Shop accepted and account type updated successfully');
            window.location.reload();
        } catch (error) {
            console.error('Error updating shop details:', error);
            alert('Error updating shop details');
        }
    };

    return (
        <div className="aadm-modal-overlay">
            <div className="aadm-modal-content">
                <button className="aadm-close" onClick={closeModal}>X</button>
                <h2>Accept Shop</h2>
                <div className="aadm-input-container">
                    <h4>
                        <a href={googleLink} target="_blank" rel="noopener noreferrer">Google Maps Link</a>
                    </h4>
                </div>
                <div className="aadm-input-container">
                    <label htmlFor="deliveryFee">Delivery Fee:</label>
                    <input
                        type="number"
                        id="deliveryFee"
                        value={deliveryFee}
                        onChange={handleDeliveryFeeChange}
                    />
                </div>
                
                <div className="aadm-modal-buttons">
                    <button className="aadm-cancel" onClick={closeModal}>Cancel</button>
                    <button className="aadm-confirm" onClick={confirmAccept}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default AdminAcceptDasherModal;

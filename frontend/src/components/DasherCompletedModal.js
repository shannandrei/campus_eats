import React from "react";
import "./css/AdminAcceptDasherModal.css";
import axios from "../utils/axiosConfig"; // Import the custom Axios instance

const DasherCompletedModal = ({ isOpen, closeModal, shopData, orderData }) => {
    if (!isOpen) return null;

    console.log('shopData:', shopData);
    console.log('orderData:', orderData);

    const confirmAccept = async () => {
        try {
            // Prepare data for completing the order
            const completedOrder = {
                orderId: orderData.id,
                dasherId: orderData.dasherId,
                shopId: orderData.shopId,
                userId: orderData.uid,
                paymentMethod: orderData.paymentMethod,
                deliveryFee: shopData.deliveryFee,
                totalPrice: orderData.totalPrice,
                items: orderData.items
            };

            // Call the backend endpoint to confirm order completion
            const response = await axios.post('/payments/confirm-order-completion', completedOrder);
            if (response.status === 200) {
                // If successful, reload the page
                window.location.reload();
            }
        } catch (error) {
            // Handle error
            console.error('Error confirming order completion:', error);
        }
    };

    return (
        <div className="aadm-modal-overlay">
            <div className="aadm-modal-content">
                <button className="aadm-close" onClick={closeModal}>X</button>
                <h2></h2>
                <div className="aadm-input-container">
                    <h4>Payment has been completed.</h4>
                </div>
                <div className="aadm-modal-buttons">
                    <button className="aadm-cancel" onClick={closeModal}>Cancel</button>
                    <button className="aadm-confirm" onClick={confirmAccept}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default DasherCompletedModal;

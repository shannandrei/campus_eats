import React from "react";
import "./css/AdminAcceptDasherModal.css";
import axios from "../utils/axiosConfig"; 
const DasherCancelOrderModal = ({ isOpen, closeModal, shopData, orderData }) => {
    if (!isOpen) return null;
    console.log('shopData:', shopData);
    console.log('orderData:', orderData);
    const confirmCancel = async () => {
        try {
            
            const updateResponse = await axios.post('/orders/update-order-status', {
                orderId: orderData.id,
                status: "cancelled_by_customer"
            });
    
            if (updateResponse.status === 200) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };
    
    return (
        <div className="aadm-modal-overlay">
            <div className="aadm-modal-content">
                <button className="aadm-close" onClick={closeModal}>X</button>
                <h2></h2>
                <div className="aadm-input-container">
                    <h4>Customer Requested to cancel order</h4>
                </div>
                <div className="aadm-modal-buttons">
                    <button className="aadm-cancel" onClick={confirmCancel}>Confirm</button>                    
                </div>
            </div>
        </div>
    );
};
export default DasherCancelOrderModal;
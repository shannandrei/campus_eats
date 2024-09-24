import React from "react";
import "./css/AdminAcceptDasherModal.css";
import axios from "../utils/axiosConfig";
const RefundOrderModal = ({ isOpen, closeModal, shopData, orderData }) => {
    if (!isOpen) return null;
    const confirmRefund = async () => {
        try {
            const updateResponse = await axios.post('/orders/update-order-status', {
                orderId: orderData.id, 
                status: 'refunded' 
            });
            if (updateResponse.status === 200) {
                // Proceed with the refund request to PayMongo
                const refundResponse = await axios.post('https://api.paymongo.com/refunds', {
                    data: {
                        attributes: {
                            amount: orderData.totalPrice * 100, // Convert to cents
                            currency: 'PHP',
                            payment_id: orderData.paymentId,
                            reason: 'requested_by_customer',
                        }
                    }
                }, {
                    headers: {
                        Authorization: `Basic ${btoa('sk_test_7HgaHqAY8NFKDhEGgj1MDq35')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (refundResponse.status === 200) {
                    window.location.reload(); 
                } else {
                    console.error('Error processing refund:', refundResponse);
                }
            }
        } catch (error) {
            console.error('Error updating order status or processing refund:', error);
        }
    };
    return (
        <div className="aadm-modal-overlay">
            <div className="aadm-modal-content">
                <button className="aadm-close" onClick={closeModal}>X</button>
                <h2></h2>
                <div className="aadm-input-container">
                    <h4>Are you sure you want to refund this order?</h4>
                </div>
                <div className="aadm-modal-buttons">
                    <button className="aadm-cancel" onClick={closeModal}>No</button>
                    <button className="aadm-confirm" onClick={confirmRefund}>Yes, Refund</button>
                </div>
            </div>
        </div>
    );
};
export default RefundOrderModal;
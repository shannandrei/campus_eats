import React from "react";
import axios from "../utils/axiosConfig";
import "./css/AdminAcceptDasherModal.css";

const DasherNoShowModal = ({ isOpen, closeModal, orderData, shopData }) => {
    if (!isOpen) return null;

    const confirm = async () => {
        try {
            // Update order status to "active_noShow"
            const updateResponse = await axios.post('/orders/update-order-status', {
                orderId: orderData.id,
                status: "no_Show"
            });

            if (updateResponse.status === 200) {
                // Proceed with confirming order completion and updating dasher status
                await axios.put(`/dashers/update/${orderData.dasherId}/status`, null, {
                    params: { status: 'active' }
                });
                window.location.reload();

            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }   
    };

    const proceedWithCompletion = async () => {
        try {
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

            const response = await axios.post('/payments/confirm-order-completion', completedOrder);
            if (response.status === 200) {
                // Update dasher status back to "active"
                
                window.location.reload();
            }
        } catch (error) {
            console.error('Error completing the order:', error);
        }
    };

    return (
        <div className="aadm-modal-overlay">
            <div className="aadm-modal-content">
                <button className="aadm-close" onClick={closeModal}>X</button>
                <h2>Marked Order as No Show</h2>
                <div className="aadm-input-container">
                    <h4>The customer failed to show up for the delivery.</h4>
                </div>
                <div className="aadm-modal-buttons">
                    <button className="aadm-confirm" onClick={confirm}>Confirm</button>
                    <button  className="aadm-cancel" onClick={closeModal}>Cancel</button>

                </div>
            </div>
        </div>
    );
};

export default DasherNoShowModal;

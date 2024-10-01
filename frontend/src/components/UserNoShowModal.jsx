import { useState } from "react";
import "./css/AdminAcceptDasherModal.css";
import axios from "../utils/axiosConfig";

const UserNoShowModal = ({ isOpen, closeModal, shopData, orderData, onNoShowConfirmed }) => {
    const[isLoading, setIsLoading] = useState(false);
    if (!isOpen) return null;
    const confirmNoShow = async () => {
        setIsLoading(true); 
        try {
            let newStatus = '';
            if (orderData.dasherId !== null) {
                console.log('orderData:', orderData);
                newStatus = 'active_waiting_for_no_show_confirmation';
            } else {
                console.log('orderData: sheesh -->', orderData);
                newStatus = 'active_noShow';
            }
            const updateResponse = await axios.post('/orders/update-order-status', {
                orderId: orderData.id,
                status: newStatus
            });

            if (updateResponse.status === 200) {
                onNoShowConfirmed(); // Notify parent component
                closeModal();
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <div className="aadm-modal-overlay">
            <div className="aadm-modal-content">
                <button className="aadm-close" onClick={closeModal}>X</button>
                <h2>No-Show Alert</h2>
                <div className="aadm-input-container">
                    <h4>Your order has been marked as a no-show.</h4>
                    <p>Please check the status of your order or contact support for assistance.</p>
                </div>
                <div className="aadm-modal-buttons">
                    <button className="aadm-cancel" onClick={confirmNoShow}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default UserNoShowModal;

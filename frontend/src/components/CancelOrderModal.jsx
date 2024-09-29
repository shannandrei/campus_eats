import { useState } from "react";
import axios from "../utils/axiosConfig";
const CancelOrderModal = ({ isOpen, closeModal, shopData, orderData, onCancelConfirmed }) => {
    const[isLoading, setIsLoading] = useState(false);
    if (!isOpen) return null;
    console.log('shopData:', shopData);
    console.log('orderData:', orderData);
    const confirmCancel = async () => {
        setIsLoading(true); 
        try {
            let newStatus = '';
            if (orderData.dasherId !== null) {
                newStatus = 'active_waiting_for_cancel_confirmation';
            } else {
                newStatus = 'cancelled_by_customer';
            }
            const updateResponse = await axios.post('/orders/update-order-status', {
                orderId: orderData.id,
                status: newStatus
            });

            if (updateResponse.status === 200) {
                onCancelConfirmed(); // Notify parent component
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
                <h2></h2>
                <div className="aadm-input-container">
                    <h4>Are you sure you want to cancel this order?</h4>
                </div>
                <div className="aadm-modal-buttons">
                    <button className="aadm-cancel" onClick={confirmCancel} disabled={isLoading}>
                        {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                    <button className="aadm-confirm" onClick={closeModal} disabled={isLoading}>
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};
export default CancelOrderModal;
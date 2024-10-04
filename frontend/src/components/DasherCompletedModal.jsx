import React, { useEffect, useState } from "react";
import axios from "../utils/axiosConfig";
import "./css/AdminAcceptDasherModal.css";
import DasherNoShowModal from "./DasherNoShowModal";


const DasherCompletedModal = ({ isOpen, closeModal, shopData, orderData }) => {
    const [checkingConfirmation, setCheckingConfirmation] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(null);
    const [isNoShowModalOpen, setIsNoShowModalOpen] = useState(false); 


    useEffect(() => {
        if (pollingInterval) {
            console.log('pollingInterval:', pollingInterval);
            return () => clearInterval(pollingInterval); // Cleanup function
        }
    }, [pollingInterval]);
    if (!isOpen) return null;
    // Function to check the order status
    const checkOrderConfirmation = async () => {
        try {
            const response = await axios.get(`/orders/${orderData.id}`);
            const updatedOrder = response.data;

            // If the order status is 'completed_confirmed', complete the order process
            console.log('updatedOrder:', updatedOrder.status);
            if (updatedOrder.status === "completed") {
                clearInterval(pollingInterval);  // Stop the interval once confirmed
                setCheckingConfirmation(false);
                proceedWithCompletion();
            }
        } catch (error) {
            console.error("Error checking order status:", error);
        }
    };

    // Function to handle confirming the order and setting the initial status
    const confirmAccept = async () => {
        try {
            // Update order status to 'completed_waiting_for_confirmation'
            await axios.post('/orders/update-order-status', {
                orderId: orderData.id,
                status: "active_waiting_for_confirmation"
            });

            // Start polling every 5 seconds to check if the order is confirmed
            setCheckingConfirmation(true);
            const intervalId = setInterval(checkOrderConfirmation, 5000);
            setPollingInterval(intervalId);
        } catch (error) {
            console.error("Error confirming order completion:", error);
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
                await axios.put(`/dashers/update/${orderData.dasherId}/status`, null, {
                    params: { status: 'active' }
                });
                closeModal()
                window.location.reload();
            }
        } catch (error) {
            console.error('Error completing the order:', error);
        }
    };

    const handleNoShowClick = () => {
        setIsNoShowModalOpen(true);
    };


    // Cleanup polling interval on component unmount
    

    return (
        <div className="aadm-modal-overlay">
            <div className="aadm-modal-content">
                <button className="aadm-close" onClick={closeModal}>X</button>
                <h2>Order Completion</h2>
                <div className="aadm-input-container">
                    <h4>Payment has been completed.</h4>
                    {checkingConfirmation && (
                        <p>Waiting for user confirmation...</p>
                    )}
                </div>
                <div className="aadm-modal-buttons">
                    <button className="aadm-cancel" onClick={closeModal}>Cancel</button>
                    <button className="aadm-confirm" onClick={confirmAccept} disabled={checkingConfirmation}>
                        Confirm
                    </button>

                    <div className="text-xs text-red-500 cursor-pointer underline hover:text-red-950 hover:no-underline" onClick={handleNoShowClick}>
                    Customer did not show? Click Here
                </div>
                </div>
            </div>
             {isNoShowModalOpen && (
                <DasherNoShowModal
                    isOpen={isNoShowModalOpen}
                    closeModal={() => setIsNoShowModalOpen(false)}
                    orderData={orderData}
                    shopData={shopData}
                />
            )}
        </div>
    );
};

export default DasherCompletedModal;

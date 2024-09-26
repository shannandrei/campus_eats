import React from "react";
import "./css/AdminAcceptDasherModal.css";
import axios from "../utils/axiosConfig";

const RefundOrderModal = ({ isOpen, closeModal, orderData }) => {
    if (!isOpen) return null;
    const confirmRefund = async () => {
        try {
            // Extract the reference number from the orderData
            
            const referenceNumber = orderData?.id;

            if (!referenceNumber) {
                alert("No reference number found for this order.");
                return;
            }

            // First, retrieve the payment details using the reference number
            const paymentResponse = await axios.get(`/payments/get-payment-by-reference/${referenceNumber}`);
            const paymentId = paymentResponse.data.payment_id;
            console.log('paymentResponse:', paymentResponse.data.payment_id);
            // If payment ID is found, proceed to initiate the refund
            if (paymentId) {
                const refundPayload = {
                    paymentId: paymentId,
                    amount: orderData.totalPrice + orderData.deliveryFee, // Amount to refund (in PHP)
                    reason: "requested_by_customer", // This can be adjusted based on your use case
                    notes: "Refund initiated by admin."
                };

                const refundResponse = await axios.post("/payments/process-refund", refundPayload);
                console.log('refundResponse:', refundResponse);
                alert("Refund successful!");
                if(refundResponse.status === 200){
                    if(orderData.dasherId !== null){
                        const updateResponse = await axios.post('/orders/update-order-status', {
                            orderId: orderData.id,
                            status: "active_waiting_for_cancel_confirmation"
                        });
                        if (updateResponse.status === 200) {
                            closeModal();
                        }
                    } else {
                        const updateResponse2 = await axios.post('/orders/update-order-status', {
                            orderId: orderData.id,
                            status: "cancelled_by_customer"
                        });
                        if (updateResponse2.status === 200) {
                            window.location.reload();
                        }
                    }

                       
                }

                // Close the modal after successful refund
                closeModal();
            } else {
                alert("Payment ID not found.");
            }
        } catch (error) {
            console.error("Error processing refund:", error);
            alert("Failed to process refund. Please try again.");
        }
    };

    return (
        <div className="aadm-modal-overlay">
            <div className="aadm-modal-content">
                <button className="aadm-close" onClick={closeModal}>X</button>
                <h2>Refund Order</h2>
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

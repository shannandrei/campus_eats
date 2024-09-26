import React, { useEffect, useState } from "react";
import "./css/AdminAcceptDasherModal.css";
import axios from "../utils/axiosConfig"; // Import axiosConfig

const AdminAcceptCashoutModal = ({ isOpen, closeModal, cashoutId }) => {
    const [referenceNumber, setReferenceNumber] = useState("");
    const [cashoutData, setCashoutData] = useState(null);

    // Fetch cashout data when the modal opens or cashoutId changes
    useEffect(() => {
        if (!isOpen) return; // Early return if the modal is not open

        const fetchCashout = async () => {
            try {
                const response = await axios.get(`/cashouts/${cashoutId}`);
                setCashoutData(response.data); // Use response.data directly
            } catch (error) {
                console.error('Error fetching cashout:', error);
            }
        };

        fetchCashout();
    }, [isOpen, cashoutId]); // Dependencies: fetch cashout data when modal opens or cashoutId changes

    const confirmAccept = async () => {
        if (referenceNumber === "") {
            alert("Please enter the reference number");
            return;
        }

        try {
            // Update reference number
            await axios.put(`/cashouts/update/${cashoutId}/reference`, null, { params: { referenceNumber: referenceNumber } });

            // Update cashout status
            await axios.put(`/cashouts/update/${cashoutId}/status`, null, { params: { status: 'paid' } });

            // Assuming cashoutData contains the amount to update the user's wallet
            await axios.put(`/dashers/update/${cashoutData.id}/wallet`, null, { params: { amountPaid: cashoutData.amount } });

            alert('Cash out successfully accepted');
            window.location.reload();
        } catch (error) {
            console.error('Error updating cashout details:', error);
            alert('Error updating cashout details');
        }
    };

    if (!isOpen) return null; // Return null if the modal is not open

    return (
        <div className="aadm-modal-overlay">
            <div className="aadm-modal-content">
                <button className="aadm-close" onClick={closeModal}>X</button>
                <h2>Confirm Transaction</h2>
                <div className="aadm-input-container">
                    <label htmlFor="referenceNumber">Reference Number:</label>
                    <input
                        type="text"
                        id="referenceNumber"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
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

export default AdminAcceptCashoutModal;

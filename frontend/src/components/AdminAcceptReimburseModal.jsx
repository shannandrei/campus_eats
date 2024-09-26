import React, { useEffect, useState } from "react";
import "./css/AdminAcceptDasherModal.css";
import axios from "../utils/axiosConfig"; // Import axiosConfig

const AdminAcceptReimburseModal = ({ isOpen, closeModal, reimburseId }) => {
    const [referenceNumber, setReferenceNumber] = useState("");
    const [reimburseData, setReimburseData] = useState(null);

    // Fetch reimburse data when the modal opens or reimburseId changes
    useEffect(() => {
        if (!isOpen) return; // Early return if the modal is not open

        const fetchReimburse = async () => {
            try {
                const response = await axios.get(`/reimburses/${reimburseId}`);
                setReimburseData(response.data); // Use response.data directly
            } catch (error) {
                console.error('Error fetching reimburse:', error);
            }
        };

        fetchReimburse();
    }, [isOpen, reimburseId]); // Dependencies: fetch reimburse data when modal opens or reimburseId changes

    const confirmAccept = async () => {
        if (referenceNumber === "") {
            alert("Please enter the reference number");
            return;
        }

        try {
            // Update reference number
            await axios.put(`/reimburses/update/${reimburseId}/reference`, null, { params: { referenceNumber: referenceNumber } });

            // Update reimburse status
            await axios.put(`/reimburses/update/${reimburseId}/status`, null, { params: { status: 'paid' } });


            alert('Cash out successfully accepted');
            window.location.reload();
        } catch (error) {
            console.error('Error updating reimburse details:', error);
            alert('Error updating reimburse details');
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

export default AdminAcceptReimburseModal;

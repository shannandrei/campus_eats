import React from 'react';
import './css/AdminDeclineOrderModal.css';


const DeclineOrderModal = ({ isOpen, closeModal, confirmDecline }) => {
    if (!isOpen) return null;

    return (
        <div className="dom-modal-overlay">
            <div className="dom-modal-content">
                <span className="dom-close" onClick={closeModal}>&times;</span>
                <h2>Decline Order</h2>
                <p>Are you sure you want to decline this order?</p>
                <div className="dom-modal-buttons">
                    <button className="dom-button dom-cancel" onClick={closeModal}>Cancel</button>
                    <button className="dom-button dom-confirm" onClick={confirmDecline}>Confirm </button>
                </div>
            </div>
        </div>
    );
};

export default DeclineOrderModal;

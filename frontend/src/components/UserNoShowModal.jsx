import "./css/AdminAcceptDasherModal.css";

const UserNoShowModal = ({ isOpen, closeModal}) => {
    if (!isOpen) return null;

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
                    <button className="aadm-cancel" onClick={closeModal}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default UserNoShowModal;

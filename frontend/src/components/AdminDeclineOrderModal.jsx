import React from 'react';

const DeclineOrderModal = ({ isOpen, closeModal, confirmDecline }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <span className="absolute top-2 right-2 cursor-pointer text-gray-600" onClick={closeModal}>&times;</span>
                <h2 className="text-lg font-semibold mb-4">Decline Order</h2>
                <p className="mb-6">Are you sure you want to decline this order?</p>
                <div className="flex justify-end">
                    <button className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 mr-2" onClick={closeModal}>Cancel</button>
                    <button className="bg-red-600 text-white rounded-md px-4 py-2" onClick={confirmDecline}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default DeclineOrderModal;

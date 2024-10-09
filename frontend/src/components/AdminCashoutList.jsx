import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import Navbar from "./Navbar/Navbar";
import "./css/AdminDasherLists.css";
import axios from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import ImageModal from "./ImageModal";
import AdminAcceptCashoutModal from "./AdminAcceptCashoutModal";

const AdminCashoutList = () => {
    const { currentUser } = useAuth();
    const [pendingCashouts, setPendingCashouts] = useState([]);
    const [currentCashouts, setCurrentCashouts] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false); // State to manage modal
    const [selectedImage, setSelectedImage] = useState("");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedCashoutId, setSelectedCashoutId] = useState(null);
    const navigate = useNavigate();

    const handleImageClick = (imageSrc) => {
        setSelectedImage(imageSrc); // Set the selected image
        setModalOpen(true); // Open the modal
    };

    const closeModal = () => {
        setModalOpen(false); // Close the modal
        setSelectedImage(""); // Reset selected image
    };


    const handleDeclineClick = async (cashoutId) => {
        if (window.confirm("Are you sure you want to decline this cashout?")) {
            try {
                await axios.put(`/cashouts/update/${cashoutId}/status`, null, { params: { status: 'declined' } });
                alert('Cashout status updated successfully');
                setPendingCashouts((prev) => prev.filter(cashout => cashout.id !== cashoutId));
            } catch (error) {
                console.error('Error updating cashout status:', error);
                alert('Error updating cashout status');
            }
        }
    };

    const handleAcceptClick = async (cashoutId) => {
        // if (window.confirm("Are you sure you want to accept this cashout?")) {
        //     try {
        //         await axios.put(`/cashouts/update/${cashoutId}/status`, null, { params: { status: 'paid' } });
        //         alert('Cashout status updated successfully');
        //         setPendingCashouts((prev) => prev.filter(cashout => cashout.id !== cashoutId));
        //     } catch (error) {
        //         console.error('Error updating cashout status:', error);
        //         alert('Error updating cashout status');
        //     }

        // }
        setSelectedCashoutId(cashoutId);
        setIsConfirmModalOpen(true);
    };

    useEffect(() => {
        const fetchCashouts = async () => {
            try {
                const response = await axios.get('/cashouts/pending-lists');
                const pendingCashoutsHold = response.data.pendingCashouts;
                console.log("pendingCashoutsHold: ", pendingCashoutsHold);
                const currentCashoutsHold = response.data.nonPendingCashouts;
                console.log("currentCashoutsHold: ", currentCashoutsHold);
                const pendingCashoutsData = await Promise.all(
                    pendingCashoutsHold.map(async (cashout) => {
                        const pendingCashoutsDataResponse = await axios.get(`/users/${cashout.id}`);
                        const pendingCashoutsData = pendingCashoutsDataResponse.data;
                        return { ...cashout, userData: pendingCashoutsData };
                    })
                );
                const currentCashoutsData = await Promise.all(
                    currentCashoutsHold.map(async (cashout) => {
                        const currentCashoutsDataResponse = await axios.get(`/users/${cashout.id}`);
                        const currentCashoutsData = currentCashoutsDataResponse.data;
                        return { ...cashout, userData: currentCashoutsData };
                    })
                );
                console.log("pendingCashoutsData: ", pendingCashoutsData);
                console.log("currentCashoutsData: ", currentCashoutsData);

                setPendingCashouts(pendingCashoutsData);
                setCurrentCashouts(currentCashoutsData);
                console.log("pendingCashouts: ", pendingCashouts);
                console.log("currentCashouts: ", currentCashouts);
            } catch (error) {
                console.error('Error fetching cashouts:', error.response.data.error);
            }
        };

        fetchCashouts();
        console.log("currentUser: ", currentUser);
    }, []);

    if(!currentUser){
        navigate('/login');
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        
        // Extracting the components
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the year
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12; // Convert to 12-hour format
        hours = hours ? String(hours).padStart(2, '0') : '12'; // If hour is 0, set it to 12
    
        return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
    };

    return (
        <>
            
            <div className="adl-body">
                <ImageModal 
                    isOpen={isModalOpen} 
                    imageSrc={selectedImage} 
                    onClose={closeModal} 
                />
                <div className="adl-title font-semibold">
                    <h2>Pending Cashouts</h2>
                </div>
                {pendingCashouts && pendingCashouts.length > 0 ? (
                    <>
                        <div className="adl-row-container">
                            <div className="adl-word">Timestamp</div>
                            <div className="adl-word">Name</div>
                            <div className="adl-word">GCASH Name</div>
                            <div className="adl-word">GCASH Number</div>
                            <div className="adl-word">Amount</div>
                            <div className="adl-word">GCASH QR</div>
                            <div className="adl-word">Actions</div>
                        </div>

                        <div className="adl-container">
                            {pendingCashouts.map(cashout => (
                                <div key={cashout.id} className="adl-box">
                                    {console.log("cashout pending: ", cashout.userData.firstname)}
                                    <div className="adl-box-content">
                                        <div>{formatDate(cashout.createdAt)}</div>
                                        <div>{cashout.userData.firstname + " " + cashout.userData.lastname}</div>
                                        <div>{cashout.gcashName}</div>
                                        <div>{cashout.gcashNumber}</div>
                                        <div>₱{cashout.amount.toFixed(2)}</div>
                                        
                                        <div>
                                        <img 
                                                src={cashout.gcashQr} 
                                                alt="GCASH QR" 
                                                className="adl-list-pic" 
                                                onClick={() => handleImageClick(cashout.gcashQr)} // Click handler
                                            />
                                        </div>
                                        <div className="adl-buttons">
                                            <button className="adl-decline" onClick={() => handleDeclineClick(cashout.id)}>Decline</button>
                                            <button className="adl-acceptorder" onClick={() => handleAcceptClick(cashout.id)}>Accept</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div>No pending cashouts</div>
                )}

                <div className="adl-title font-semibold">
                    <h2>Cashouts</h2>
                </div>
                {currentCashouts && currentCashouts.length > 0 ? (
                    <>
                        <div className="adl-row-container">
                            <div className="adl-word">Date Requested</div>
                            <div className="adl-word">Date Paid</div>
                            <div className="adl-word">Reference No.</div>
                            <div className="adl-word">Name</div>
                            <div className="adl-word">GCASH Name</div>
                            <div className="adl-word">GCASH Number</div>
                            <div className="adl-word">Amount</div>
                            <div className="adl-word">GCASH QR</div>
                        </div>

                        <div className="adl-container">
                            {currentCashouts.map(cashout => (
                                <div key={cashout.id} className="adl-box">
                                    {console.log("cashout current: ", cashout)}
                                    <div className="adl-box-content">
                                        <div>{formatDate(cashout.createdAt)}</div>
                                        <div>{formatDate(cashout.paidAt)}</div>
                                        <div>{cashout.referenceNumber}</div>
                                        <div>{cashout.userData.firstname + " " + cashout.userData.lastname}</div>
                                        <div>{cashout.gcashName}</div>
                                        <div>{cashout.gcashNumber}</div>
                                        <div>₱{cashout.amount.toFixed(2)}</div>
                                        
                                        <div>
                                        <img 
                                                src={cashout.gcashQr} 
                                                alt="GCASH QR" 
                                                className="adl-list-pic" 
                                                onClick={() => handleImageClick(cashout.gcashQr)} // Click handler
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div>No current cashouts</div>
                )}
            </div>
            <AdminAcceptCashoutModal isOpen={isConfirmModalOpen} closeModal={() => setIsConfirmModalOpen(false)} cashoutId={selectedCashoutId} />
        </>
    );
};


export default AdminCashoutList;

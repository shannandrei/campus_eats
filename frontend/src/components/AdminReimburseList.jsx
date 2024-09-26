import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import Navbar from "./Navbar/Navbar";
import "./css/AdminDasherLists.css";
import axios from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import ImageModal from "./ImageModal";
import AdminAcceptReimburseModal from "./AdminAcceptReimburseModal";

const AdminReimburseList = () => {
    const { currentUser } = useAuth();
    const [pendingReimburses, setPendingReimburses] = useState([]);
    const [currentReimburses, setCurrentReimburses] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false); // State to manage modal
    const [selectedImage, setSelectedImage] = useState("");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedReimburseId, setSelectedReimburseId] = useState(null);
    const navigate = useNavigate();

    const handleImageClick = (imageSrc) => {
        setSelectedImage(imageSrc); // Set the selected image
        setModalOpen(true); // Open the modal
    };

    const closeModal = () => {
        setModalOpen(false); // Close the modal
        setSelectedImage(""); // Reset selected image
    };


    const handleDeclineClick = async (reimburseId) => {
        if (window.confirm("Are you sure you want to decline this reimburse?")) {
            try {
                await axios.put(`/reimburses/update/${reimburseId}/status`, null, { params: { status: 'declined' } });
                alert('Reimburse status updated successfully');
                setPendingReimburses((prev) => prev.filter(reimburse => reimburse.id !== reimburseId));
            } catch (error) {
                console.error('Error updating reimburse status:', error);
                alert('Error updating reimburse status');
            }
        }
    };

    const handleAcceptClick = async (reimburseId) => {
        // if (window.confirm("Are you sure you want to accept this reimburse?")) {
        //     try {
        //         await axios.put(`/reimburses/update/${reimburseId}/status`, null, { params: { status: 'paid' } });
        //         alert('Reimburse status updated successfully');
        //         setPendingReimburses((prev) => prev.filter(reimburse => reimburse.id !== reimburseId));
        //     } catch (error) {
        //         console.error('Error updating reimburse status:', error);
        //         alert('Error updating reimburse status');
        //     }

        // }
        setSelectedReimburseId(reimburseId);
        setIsConfirmModalOpen(true);
    };

    useEffect(() => {
        const fetchReimburses = async () => {
            try {
                const response = await axios.get('/reimburses/pending-lists');
                const pendingReimbursesHold = response.data.pendingReimburses;
                console.log("pendingReimbursesHold: ", pendingReimbursesHold);
                const currentReimbursesHold = response.data.nonPendingReimburses;
                console.log("currentReimbursesHold: ", currentReimbursesHold);
                const pendingReimbursesData = await Promise.all(
                    pendingReimbursesHold.map(async (reimburse) => {
                        const pendingReimbursesDataResponse = await axios.get(`/users/${reimburse.dasherId}`);
                        const pendingReimbursesData = pendingReimbursesDataResponse.data;
                        return { ...reimburse, userData: pendingReimbursesData };
                    })
                );
                const currentReimbursesData = await Promise.all(
                    currentReimbursesHold.map(async (reimburse) => {
                        const currentReimbursesDataResponse = await axios.get(`/users/${reimburse.dasherId}`);
                        const currentReimbursesData = currentReimbursesDataResponse.data;
                        return { ...reimburse, userData: currentReimbursesData };
                    })
                );
                console.log("pendingReimbursesData: ", pendingReimbursesData);
                console.log("currentReimbursesData: ", currentReimbursesData);

                setPendingReimburses(pendingReimbursesData);
                setCurrentReimburses(currentReimbursesData);
                console.log("pendingReimburses: ", pendingReimburses);
                console.log("currentReimburses: ", currentReimburses);
            } catch (error) {
                console.error('Error fetching reimburses:', error.response.data.error);
            }
        };

        fetchReimburses();
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
                <div className="adl-title">
                    <h2>Pending Reimburses</h2>
                </div>
                {pendingReimburses && pendingReimburses.length > 0 ? (
                    <>
                        <div className="adl-row-container">
                            <div className="adl-word">Timestamp</div>
                            <div className="adl-word">Dasher Name</div>
                            <div className="adl-word">GCASH Number</div>
                            <div className="adl-word">Amount</div>
                            <div className="adl-word">Location Proof</div>
                            <div className="adl-word">Attempt Proof</div>
                            <div className="adl-word">GCASH QR</div>
                            <div className="adl-word">Actions</div>
                        </div>

                        <div className="adl-container">
                            {pendingReimburses.map(reimburse => (
                                <div key={reimburse.id} className="adl-box">
                                    {console.log("reimburse pending: ", reimburse.userData.firstname)}
                                    <div className="adl-box-content">
                                        <div>{formatDate(reimburse.createdAt)}</div>
                                        <div>{reimburse.userData.firstname + " " + reimburse.userData.lastname}</div>
                                        <div>{reimburse.gcashNumber}</div>
                                        <div>₱{reimburse.amount.toFixed(2)}</div>
                                        <div>
                                        <img 
                                                src={reimburse.locationProof} 
                                                alt="Location Proof" 
                                                className="adl-list-pic" 
                                                onClick={() => handleImageClick(reimburse.locationProof)} // Click handler
                                            />
                                        </div>
                                        <div>
                                        <img 
                                                src={reimburse.noShowProof} 
                                                alt="GCASH QR" 
                                                className="adl-list-pic" 
                                                onClick={() => handleImageClick(reimburse.noShowProof)} // Click handler
                                            />
                                        </div>
                                        <div>
                                        <img 
                                                src={reimburse.gcashQr} 
                                                alt="GCASH QR" 
                                                className="adl-list-pic" 
                                                onClick={() => handleImageClick(reimburse.gcashQr)} // Click handler
                                            />
                                        </div>
                                        <div className="adl-buttons">
                                            <button className="adl-decline" onClick={() => handleDeclineClick(reimburse.id)}>Decline</button>
                                            <button className="adl-acceptorder" onClick={() => handleAcceptClick(reimburse.id)}>Accept</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div>No pending reimburses</div>
                )}

                <div className="adl-title">
                    <h2>Reimburses</h2>
                </div>
                {currentReimburses && currentReimburses.length > 0 ? (
                    <>
                        <div className="adl-row-container">
                            <div className="adl-word">Order ID</div>
                            <div className="adl-word">Date Requested</div>
                            <div className="adl-word">Date Paid</div>
                            <div className="adl-word">Reference No.</div>
                            
                            <div className="adl-word">Dasher Name</div>
                            <div className="adl-word">GCASH Name</div>
                            <div className="adl-word">GCASH Number</div>
                            <div className="adl-word">Amount</div>
                            <div className="adl-word">GCASH QR</div>
                        </div>

                        <div className="adl-container">
                            {currentReimburses.map(reimburse => (
                                <div key={reimburse.id} className="adl-box">
                                    {console.log("reimburse current: ", reimburse)}
                                        <div className="adl-box-content">
                                        <div style={{fontSize:'12px'}}>{reimburse.orderId}</div>
                                        <div>{formatDate(reimburse.createdAt)}</div>
                                        <div>{formatDate(reimburse.paidAt)}</div>
                                        <div>{reimburse.referenceNumber}</div>
                                        
                                        <div>{reimburse.userData.firstname + " " + reimburse.userData.lastname}</div>
                                        <div>{reimburse.gcashName}</div>
                                        <div>{reimburse.gcashNumber}</div>
                                        <div>₱{reimburse.amount.toFixed(2)}</div>
                                        
                                        <div>
                                        <img 
                                                src={reimburse.gcashQr} 
                                                alt="GCASH QR" 
                                                className="adl-list-pic" 
                                                onClick={() => handleImageClick(reimburse.gcashQr)} // Click handler
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div>No current reimburses</div>
                )}
            </div>
            <AdminAcceptReimburseModal isOpen={isConfirmModalOpen} closeModal={() => setIsConfirmModalOpen(false)} reimburseId={selectedReimburseId} />
        </>
    );
};


export default AdminReimburseList;

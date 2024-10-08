import Tooltip from '@mui/material/Tooltip';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import axios from "../utils/axiosConfig";
import DasherCashoutModal from "./DasherCashoutModal";
import "./css/ShopApplication.css";

const DasherCashout = () => {
  const { currentUser } = useAuth();
  const [cashout, setCashout] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
     const [GCASHName, setGCASHName] = useState("");
const [GCASHNumber, setGCASHNumber] = useState("");
const [cashoutAmount, setCashoutAmount] = useState(0);
const [uploadedImage, setUploadedImage] = useState(null);
const [imageFile, setImageFile] = useState(null);
const [wallet, setWallet] = useState(0);
const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [dasherData, setDasherData] = useState({});
  



  const navigate = useNavigate();

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    setImageModalOpen(true);
  };

  const closeModal = () => {
    setImageModalOpen(false); // Close the modal
    setSelectedImage(""); // Reset selected image
};

 const fetchCashoutData = async () => {
    try {
        const response = await axios.get(`/cashouts/${currentUser.id}`);
            setCashout(response.data); 
    } catch (error) {
        console.error("Error fetching cashout data:", error);
    }
};

const fetchDasherData = async () => {
    try {
      const response = await axios.get(`/dashers/${currentUser.id}`);
      setDasherData(response.data);
    } catch (error) {
      console.error("Error fetching dasher data:", error);
    }
  };

  useEffect(() => {
    fetchCashoutData();
    fetchDasherData();
  }, [currentUser]);



  const handleDeleteClick = async (id) => {
    try {
      const response = await axios.delete(`/cashouts/delete/${id}`);
      console.log("Response:", response);

      if (response.status !== 200) {
        throw new Error(response.data.error || "Failed to delete cashout request");
      }

      setCashout(null);

      alert("Cashout request deleted successfully.");
      
    } catch (error) {
      console.error("Error deleting cashout request:", error);
      alert(error.message);
    }
  };


const HandleEditClick = async (id) => {
    try {
      const response = await axios.get(`/cashouts/${id}`);
      const data = response.data;
      setEditData(data);
      setGCASHName(data.gcashName);
      setGCASHNumber(data.gcashNumber);
      setCashoutAmount(data.amount);
      setUploadedImage(data.gcashQr);
      setIsEditMode(true);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching cashout data:", error);
    }
  };

    
  ;

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


  const openModal = () => {
    setIsEditMode(false);
    setIsModalOpen(true);
  };
 const closeIt = () => setIsModalOpen(false);

// const WithdrawModal = ({isOpen, onClose}) => {

// const [GCASHName, setGCASHName] = useState("");
// const [GCASHNumber, setGCASHNumber] = useState("");
// const [cashoutAmount, setCashoutAmount] = useState(0);
// const [uploadedImage, setUploadedImage] = useState(null);
// const [imageFile, setImageFile] = useState(null);
// const [dragOver, setDragOver] = useState(false);
// const [wallet, setWallet] = useState(0);


// const fetchDasherData = async () => {
//       try {
//         const response = await axios.get(`/dashers/${currentUser.id}`);
//         const data = response.data;
//         setGCASHName(data.gcashName);
//         setGCASHNumber(data.gcashNumber);
//         setWallet(data.wallet);
//       } catch (error) {
//         console.error("Error fetching dasher data:", error);
//       }
//     };

// useEffect(() => {
//   fetchDasherData();
// }, [currentUser]);


//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setImageFile(file);
//     processFile(file);
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setDragOver(true);
//   };

//   const handleDragLeave = () => {
//     setDragOver(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setDragOver(false);
//     const file = e.dataTransfer.files[0];
//     setImageFile(file);
//     processFile(file);
//   };

//   const processFile = (file) => {
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setUploadedImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };



//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
  
//     if (!uploadedImage) {
//       alert("Please upload a GCASH QR image.");
//       return;
//     }
  
//     if (!GCASHNumber.startsWith('9') || GCASHNumber.length !== 10) {
//       alert("Please provide a valid GCASH Number.");
//       return;
//     }
//     if(cashoutAmount < 100 ) {
//       alert("Minimum cashout amount is ₱100.");
//       return;
//     }
  
    
  
//     const cashout = {
//       gcashName: GCASHName,
//       gcashNumber: GCASHNumber,
//       amount: cashoutAmount,
//     };
  
//     const formData = new FormData();
//     formData.append("cashout", new Blob([JSON.stringify(cashout)], { type: "application/json" }));
//     formData.append("image", imageFile);
//     formData.append("userId", new Blob([currentUser.id], { type: "text/plain" }));
  
//     try {
//       const response = await axios.post("/cashouts/create", formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
//       console.log("response: ", response);
  
//       if (response.status === 200 || response.status === 201) {
//         alert("Cashout request submitted successfully.");
//         closeIt();
//         fetchCashoutData();
//       } else {
//         alert("Failed to submit dasher application.");
//       }
//     } catch (error) {
//       if (error.response && error.response.data) {
//         alert(error.response.data);
//       } else {
//         console.error("Error submitting form:", error);
//         alert("Error submitting form");
//       }
//     }
//   };




// if(!isOpen) return null
// return(
//   <Modal
//   open={isOpen}
//   onClose={closeIt}
//   aria-labelledby="modal-modal-title"
//   aria-describedby="modal-modal-description"
//   keepMounted
// >
// <div className="adl-body">
//     <div className="p-content-current">
//       <div className="p-card-current">
//         <div className="p-container">
//           <div className="p-content">
//             <div className="p-text">
//               <h3>Withdraw Wallet</h3>
//               <h4>
//                 It may take up to 3-5 business days for the amount to be reflected in your GCASH account.
//               </h4>
//             </div>
//           </div>
//           <div className="p-info">
//             <form onSubmit={handleSubmit}>

//               <div className="p-two">
//                 <div className="p-field-two">
//                   <div className="p-label-two">
//                     <h3>GCASH Name</h3>
//                     <input
//                       type="text"
//                       className="gcash-name"
//                       value={GCASHName}
//                       onChange={(e) => setGCASHName(e.target.value)}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="p-field-two">
//                   <div className="p-label-two">
//                     <h3>GCASH Number</h3>
//                     <div className="gcash-input-container">
//                       <span className="gcash-prefix">+63 </span>
//                       <input
//                         type="number"
//                         className="gcash-num"
//                         value={GCASHNumber}
//                         onChange={(e) => setGCASHNumber(e.target.value)}
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="p-two">
//                 <div className="sa-upload">
//                   <div className="sa-label-upload">
//                     <h3>GCASH Personal QR Code</h3>
//                   </div>
//                   <div
//                     className={`sa-upload-container ${
//                       dragOver ? "drag-over" : ""
//                     }`}
//                     // style={{height: "400px", width: "250px"}}
//                     onDragOver={handleDragOver}
//                     onDragLeave={handleDragLeave}
//                     onDrop={handleDrop}
//                   >
//                     <label htmlFor="sa-govID" className="sa-drop-area">
//                       <input
//                         type="file"
//                         hidden
//                         id="sa-govID"
//                         className="sa-govID-input"
//                         onChange={handleFileChange}
//                       />
//                       <div className="sa-img-view">
//                         {uploadedImage ? (
//                           <img
//                             src={uploadedImage}
//                             alt="Uploaded"
//                             style={{
//                               width: "100%",
//                               height: "100%",
//                               borderRadius: "20px",
//                               objectFit: "cover",
//                             }}
//                           />
//                         ) : (
//                           <>
//                             <FontAwesomeIcon
//                               icon={faUpload}
//                               className="sa-upload-icon"
//                             />
//                             <p>
//                               Drag and Drop or click here <br /> to upload
//                               image
//                             </p>
//                           </>
//                         )}
//                       </div>
//                     </label>
//                   </div>
//                 </div>

//                 <div className="sa-shop-categories">
//                 <div className="p-label-two">
//                     <h3>Cashout Amount (Wallet: ₱{wallet})</h3>
//                     <div className="gcash-input-container">
//                       <input
//                         type="number"
//                         className="gcash-num"
//                         value={cashoutAmount}
//                         onChange={(e) => setCashoutAmount(e.target.value)}
//                         max={wallet}
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>
                
//               </div>
//               <div className="p-buttons">
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(false)} 
//                   className="p-logout-button"
//                 >
//                   Cancel
//                 </button>
//                 <button type="submit" className="p-save-button">
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
        
//       </div>
//     </div>
//   </div>
//   </Modal>
// )
// }

  return (
    <>
            <div className="adl-body">
                <div className="adl-title">
                    <h2>You have a pending cashout request</h2>
                </div>
                <div className="adl-row-container">
                    <div className="adl-word">Timestamp</div>
                    <div className="adl-word">GCASH Name</div>
                    <div className="adl-word">GCASH Number</div>
                    <div className="adl-word">Amount</div>
                    <div className="adl-word">GCASH QR</div>
                    <div className="adl-word">Actions</div>
                </div>

                <div className="adl-container">
                    {cashout && (
                      <div key={cashout.id} className="adl-box">
                        <div className="adl-box-content">
                          <div>{formatDate(cashout.createdAt)}</div>
                          <div>{cashout.gcashName}</div>
                          <div>{cashout.gcashNumber}</div>
                          <div>₱{cashout.amount.toFixed(2)}</div>
                          <div>
                            <img 
                              src={cashout.gcashQr} 
                              alt="GCASH QR" 
                              className="adl-list-pic" 
                              onClick={() => handleImageClick(cashout.gcashQr)} 
                            />
                          </div>
                          <div className="adl-buttons">
                            <button className="adl-decline" onClick={() => handleDeleteClick(cashout.id)}>Delete</button>
                            <button className="adl-acceptorder" onClick={() => HandleEditClick(cashout.id)}>Edit</button>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                <Tooltip title={cashout ? "You can only have one pending cashout request at a time." : ""}>
                    <span>
                      <button
                        onClick={openModal}
                        disabled={cashout !== null} 
                        className="mt-2 rounded-md bg-red-700 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:shadow-none hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2"
                        type="button"
                      >
                        Request Cashout
                      </button>
                    </span>
                </Tooltip>

                <DasherCashoutModal isOpen={isModalOpen} onClose={closeIt}
        dasherData={dasherData}
        isEditMode={isEditMode}
        editData={editData}
        currentUser={currentUser}
                />
            </div>
        </>
     

  );
};

export default DasherCashout;

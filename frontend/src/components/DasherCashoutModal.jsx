import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '@mui/material/Modal';
import React, { useEffect, useState } from 'react';
import axios from "../utils/axiosConfig";


const DasherCashoutModal = ({
  isOpen,
  onClose,
  dasherData,
  isEditMode,
  editData,
  currentUser
}) => {
  const [GCASHName, setGCASHName] = useState(dasherData.gcashName || "");
  const [GCASHNumber, setGCASHNumber] = useState(dasherData.gcashNumber || "");
  const [cashoutAmount, setCashoutAmount] = useState(editData ? editData.amount : 0);
  const [uploadedImage, setUploadedImage] = useState(editData ? editData.gcashQr : null);
  const [imageFile, setImageFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [wallet, setWallet] = useState(dasherData.wallet || 0);

 useEffect(() => {    
    if (editData) {
      setGCASHName(editData.gcashName);
      setGCASHNumber(editData.gcashNumber);
      setCashoutAmount(editData.amount);
      setUploadedImage(editData.gcashQr);
    } else {
                console.log("TRUE BA ITO??",isEditMode)
      setGCASHName(dasherData.gcashName || "");
      setGCASHNumber(dasherData.gcashNumber || "");
      setWallet(dasherData.wallet || 0);
    }
  }, [editData, dasherData]);





   const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    processFile(file);
  };

   const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    setImageFile(file);
    processFile(file);
  };

  const processFile = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uploadedImage) {
      alert("Please upload a GCASH QR image.");
      return;
    }

    if (!GCASHNumber.startsWith('9') || GCASHNumber.length !== 10) {
      alert("Please provide a valid GCASH Number.");
      return;
    }
    if (cashoutAmount < 100) {
      alert("Minimum cashout amount is ₱100.");
      return;
    }

    const cashout = {
      gcashName: GCASHName,
      gcashNumber: GCASHNumber,
      amount: cashoutAmount,
    };

    const formData = new FormData();
    formData.append("cashout", new Blob([JSON.stringify(cashout)], { type: "application/json" }));
if (imageFile) {
  formData.append("image", imageFile);  // Only append if the image is present
}    formData.append("userId", new Blob([currentUser.id], { type: "text/plain" }));

    try {
       const url = isEditMode ? `/cashouts/update/${editData.id}` : "/cashouts/create";
      const method = isEditMode ? 'put' : 'post'; // Use PUT for updates and POST for creation
      console.log("Submitting to URL:", url);
      console.log("FormData:", formData);

      const response = await axios({
        method: method,
        url: url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("response: ", response);

      if (response.status === 200 || response.status === 201) {
        alert(isEditMode ? "Cashout request updated successfully." : "Cashout request submitted successfully.");
        onClose();
        //refresh screen
        window.location.reload();
        // Optionally, you can refresh the data here
      } else {
        alert("Failed to submit cashout request.");
      }
    } catch (error) {
      console.error("Error submitting cashout request:", error);
      alert("An error occurred while submitting the cashout request.");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      keepMounted
    >
      <div className="adl-body">
        <div className="p-content-current">
          <div className="p-card-current">
            <div className="p-container">
              <div className="p-content">
                <div className="p-text">
                  <h3>{isEditMode ? "Edit Cashout Request" : "Withdraw Wallet"}</h3>
                  <h4>
                    It may take up to 3-5 business days for the amount to be reflected in your GCASH account.
                  </h4>
                </div>
              </div>
              <div className="p-info">
                <form onSubmit={handleSubmit}>
                  <div className="p-two">
                    <div className="p-field-two">
                      <div className="p-label-two">
                        <h3>GCASH Name</h3>
                        <input
                          type="text"
                          className="gcash-name"
                          value={GCASHName}
                          onChange={(e) => setGCASHName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="p-field-two">
                      <div className="p-label-two">
                        <h3>GCASH Number</h3>
                        <div className="gcash-input-container">
                          <span className="gcash-prefix">+63 </span>
                          <input
                            type="number"
                            className="gcash-num"
                            value={GCASHNumber}
                            onChange={(e) => setGCASHNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>



                  <div className="p-two">
                    <div className="sa-upload">
                      <div className="sa-label-upload">
                        <h3>GCASH Personal QR Code</h3>
                      </div>
                      <div
                        className={`sa-upload-container ${
                          dragOver ? "drag-over" : ""
                        }`}
                        // style={{height: "400px", width: "250px"}}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <label htmlFor="sa-govID" className="sa-drop-area">
                          <input
                            type="file"
                            hidden
                            id="sa-govID"
                            className="sa-govID-input"
                            onChange={handleFileChange}
                          />
                          <div className="sa-img-view">
                            {uploadedImage ? (
                              <img
                                src={uploadedImage}
                                alt="Uploaded"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  borderRadius: "20px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <>
                                <FontAwesomeIcon
                                  icon={faUpload}
                                  className="sa-upload-icon"
                                />
                                <p>
                                  Drag and Drop or click here <br /> to upload
                                  image
                                </p>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    
                 <div className="sa-shop-categories">
                 <div className="p-label-two">
                    <h3>Cashout Amount (Wallet: ₱{wallet})</h3>
                   <div className="gcash-input-container">
                      <input
                        type="number"
                        className="gcash-num"
                        value={cashoutAmount}
                        onChange={(e) => setCashoutAmount(e.target.value)}
                        max={wallet}
                        required
                      />
                    </div>
                  </div>
                  </div>
                </div>
                  <div className="p-buttons">
                    <button
                      type="button"
                      onClick={onClose} 
                      className="p-logout-button"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="p-save-button">
                      {isEditMode ? "Update" : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DasherCashoutModal;
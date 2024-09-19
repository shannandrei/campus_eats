import React, { useEffect, useState } from "react";
import "./css/ShopApplication.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosConfig";
import { useAuth } from "../utils/AuthContext";

const DasherCashout = () => {
  const { currentUser } = useAuth();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [GCASHName, setGCASHName] = useState("");
  const [GCASHNumber, setGCASHNumber] = useState("");
  const [wallet, setWallet] = useState(0);
  const [cashoutAmount, setCashoutAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDasherData = async () => {
      try {
        const response = await axios.get(`/dashers/${currentUser.id}`);
        const data = response.data;
        setGCASHName(data.gcashName);
        setGCASHNumber(data.gcashNumber);
        setWallet(data.wallet);
      } catch (error) {
        console.error("Error fetching dasher data:", error);
      }
    };

    fetchDasherData();
  }, [currentUser]);

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
    if(cashoutAmount < 100 ) {
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
    formData.append("image", imageFile);
    formData.append("userId", new Blob([currentUser.id], { type: "text/plain" }));
  
    try {
      const response = await axios.post("/cashouts/create", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("response: ", response);
  
      if (response.status === 200 || response.status === 201) {
        alert("Cashout request submitted successfully.");
        navigate("/profile");
      } else {
        alert("Failed to submit dasher application.");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data);
      } else {
        console.error("Error submitting form:", error);
        alert("Error submitting form");
      }
    }
  };
  

  return (
    <>
      <Navbar />

      <div className="p-body">
        <div className="p-content-current">
          <div className="p-card-current">
            <div className="p-container">
              <div className="p-content">
                <div className="p-text">
                  <h3>Withdraw Wallet</h3>
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
                      onClick={() => navigate("/profile")}
                      className="p-logout-button"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="p-save-button">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DasherCashout;

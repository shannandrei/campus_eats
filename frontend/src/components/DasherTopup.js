import React, { useEffect, useState } from "react";
import "./css/ShopApplication.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import Navbar from "./Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosConfig";
import { useAuth } from "../utils/AuthContext";

const DasherTopup = () => {
  const { currentUser } = useAuth();
  const [dasherData, setDasherData] = useState(0);
  const [topupAmount, setTopupAmount] = useState(0);
    const [paymentLinkId, setPaymentLinkId] = useState("");
    const [waitingForPayment, setWaitingForPayment] = useState(false);
    const [loading, setLoading] = useState(false);
    let pollInterval;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDasherData = async () => {
      try {
        const response = await axios.get(`/dashers/${currentUser.id}`);
        const data = response.data;
        setDasherData(data);
        setTopupAmount(data.wallet < 0 ? Math.abs(data.wallet) : 0);
      } catch (error) {
        console.error("Error fetching dasher data:", error);
      }
    };

    fetchDasherData();
  }, [currentUser]);



  const handleSubmit = async (e) => {
    
    e.preventDefault();
    setLoading(true);
  
    console.log("Topup amount:", topupAmount);
    if(topupAmount < 100 ) {
      alert("Minimum topup amount is ₱100.");
      setLoading(false);
      return;
    }
  
    const pollPaymentStatus = async (linkId) => {
        const options = {
            method: 'GET',
            url: `https://api.paymongo.com/v1/links/${linkId}`,
            headers: {
                accept: 'application/json',
                authorization: 'Basic c2tfdGVzdF83SGdhSHFBWThORktEaEVHZ2oxTURxMzU6'
            }
        };

        try {
            const response = await axios.request(options);
            const paymentStatus = response.data.data.attributes.status;
            console.log("Payment status:", paymentStatus);
            if (paymentStatus === 'paid') {
                setWaitingForPayment(false);
                clearInterval(pollInterval);
                await axios.put(`/dashers/update/${dasherData.id}/wallet`, null, { params: { amountPaid: -(topupAmount) } });
                alert("Payment successful!");
                navigate("/profile");
            }
        } catch (error) {
            console.error("Error checking payment status:", error);
        }
        setLoading(false);
    };
    
  
    try {
        const response = await axios.post("/payments/create-gcash-payment/topup", {
            amount: topupAmount,
            description: `topup payment`
        });

        const data = response.data;
        window.open(data.checkout_url, "_blank");
        setPaymentLinkId(data.id);
        setWaitingForPayment(true);
        setLoading(false);

        pollInterval = setInterval(() => {
            pollPaymentStatus(data.id);
        }, 10000);

        return () => clearInterval(pollInterval);
    } catch (error) {
        console.error("Error creating GCash payment:", error);
        setLoading(false);
        return;
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
                  <h3>Top up wallet</h3>
                  <h4>
                    Note: This is only advisable if you have a negative wallet.
                  </h4>
                </div>
              </div>
              <div className="p-info">
                <form onSubmit={handleSubmit}>

                
                  <div className="p-two">
                    

                    <div className="sa-shop-categories">
                    <div className="p-label-two">
                        <h3>Top Up Amount (Wallet: ₱{dasherData.wallet})</h3>
                        <div className="gcash-input-container">
                        <input
                            type="number"
                            className="gcash-num"
                            value={topupAmount}
                            onChange={(e) => setTopupAmount(e.target.value)}
                            max={Math.abs(dasherData.wallet)}  // Set max to the absolute value of the wallet
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
                    <button type="submit" className="p-save-button" disabled={loading || waitingForPayment}>
                                        {waitingForPayment ? "Waiting for Payment" : "Submit"}
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

export default DasherTopup;

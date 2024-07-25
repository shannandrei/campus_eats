import React, { useEffect, useState } from "react";
import axiosConfig from "../utils/axiosConfig"; // Update this import to use your configured axios instance
import "./css/DasherOrders.css";
import { useAuth } from "../utils/AuthContext";
import Navbar from "./Navbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import DeclineOrderModal from './AdminDeclineOrderModal';
import { useNavigate } from "react-router-dom";

const DasherIncomingOrder = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isAccordionOpen, setIsAccordionOpen] = useState({});
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosConfig.get('/orders/incoming-orders/dasher');
        const ordersWithShopData = await Promise.all(response.data.map(async order => {
          const shopDataResponse = await axiosConfig.get(`/shops/${order.shopId}`);
          const shopData = shopDataResponse.data;
          return { ...order, shopData };
        }));
        setOrders(ordersWithShopData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    if (isActive) {
      fetchOrders();
    }

    const fetchDasherData = async () => {
      console.log(currentUser);
      if(currentUser){
      try {
        const response = await axiosConfig.get(`/dashers/${currentUser.id}`);
        const data = response.data;
        console.log(data.status);
        if(data.status === 'active'){
          setIsActive(true);
        } else if(data.status === 'offline'){
          setIsActive(false);
        }
        
      } catch (error) {
        console.error("Error fetching dasher data:", error);
      }
    }
    };

    fetchDasherData();
  }, [isActive, currentUser]);

  const toggleAccordion = (orderId) => {
    setIsAccordionOpen((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId]
    }));
  };

  const handleSubmit = async (orderId) => {
    try {
      const response = await axiosConfig.post('/orders/assign-dasher', { orderId, dasherId: currentUser.id });
      if (response.data.success) {
        alert('Dasher assigned successfully');
        await axiosConfig.post('/orders/update-order-status', { orderId, status: 'active_toShop' });
        setOrders(prevOrders => prevOrders.map(order => (
          order.id === orderId ? { ...order, dasherId: currentUser.id, status: 'active_toShop' } : order
        )));
        navigate('/dasher-orders')
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error assigning dasher:', error);
      alert('An error occurred while assigning the dasher. Please try again.');
    }
  };

  const toggleButton = async () => {
    try {
      const newStatus = !isActive ? 'active' : 'offline';
      await axiosConfig.put(`/dashers/update/${currentUser.id}/status`, null, {
        params: {
          status: newStatus
        }
      });
      setIsActive(!isActive);
      if(newStatus === 'offline'){
        setOrders([]);
      }
    } catch (error) {
      console.error('Error updating dasher status:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="do-body">
        <div className="j-card-large">
          <div className="do-title">
            <h2>Incoming Orders</h2>
          </div>
          {!isActive && <div className="do-no-orders">Turn on your active status to receive incoming orders...</div>}
          {isActive && orders.length === 0 && <div className="do-no-orders">No incoming orders...</div>}
          {orders.map((order) => (
            <div key={order.id} className="do-content-current">
              <div className="do-card-current do-card-large">
                <div className="do-card-content" onClick={() => toggleAccordion(order.id)}>
                  <div className="do-order-img-holder">
                    <img src='/Assets/Panda.png' alt="food" className="do-order-img" />
                  </div>
                  <div className="do-card-text">
                    <h3>{`${order.firstname} ${order.lastname}`}</h3>
                    <p>{`Order #${order.id}`}</p>
                    <p>{order.paymentMethod === 'gcash' ? 'Online Payment' : 'Cash on Delivery'}</p>
                    <p>Change for: ₱{order.changeFor ? order.changeFor : ''}</p>
                  </div>
                  <div className="do-buttons">
                    <button className="do-acceptorder" onClick={() => handleSubmit(order.id)}>Accept Order</button>
                  </div>
                  <div className="do-toggle-content">
                    <FontAwesomeIcon icon={faAngleDown} rotation={isAccordionOpen[order.id] ? 180 : 0} />
                  </div>
                </div>
                
                {isAccordionOpen[order.id] && (
                  <div className="do-accordion">
                    <div className="o-order-summary">
                      <h3>Order Summary</h3>
                      {order.items.map((item, index) => (
                        <div className="o-order-summary-item" key={index}>
                          <div className="o-order-summary-item-header">
                            <p>{item.quantity}x</p>
                            <p>{item.name}</p>
                          </div>
                          <p>₱{item.price}</p>
                        </div>
                      ))}
                      <div className="o-order-summary-total-container">
                        <div className="o-order-summary-subtotal">
                          <h4>Subtotal</h4>
                          <h4>₱{order.totalPrice.toFixed(2)}</h4>
                        </div>
                        <div className="o-order-summary-subtotal">
                          <h4>Delivery Fee</h4>
                          <h4>₱{order.shopData ? order.shopData.deliveryFee.toFixed(2) : ''}</h4>
                        </div>
                        <div className="o-order-summary-total">
                          <h4>Total</h4>
                          <h4>₱{order.totalPrice && order.shopData ? (order.totalPrice + order.shopData.deliveryFee).toFixed(2) : ''}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="j-card-current-j-card-small">
          <h5>Dasher Status</h5>
          <div className="j-active-buton">
            <button onClick={toggleButton} className={isActive ? 'button-active' : 'button-inactive'}></button>
            <div className="j-button-text">
              {isActive ? 'Active' : 'Not Active'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DasherIncomingOrder;

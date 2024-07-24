import React, { useEffect, useState } from "react";
import axios from "../utils/axiosConfig";
import "./css/AdminOrders.css";
import { useAuth } from "../utils/AuthContext";
import Navbar from "./Navbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import DeclineOrderModal from './AdminDeclineOrderModal';

const AdminIncomingOrder = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isAccordionOpen, setIsAccordionOpen] = useState({});
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeDashers, setActiveDashers] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/orders/active-lists');
        const ordersWithShopData = await Promise.all(response.data.map(async order => {
          const shopDataResponse = await axios.get(`/shops/${order.shopID}`);
          const shopData = shopDataResponse.data;
          return { ...order, shopData };
        }));
        setOrders(ordersWithShopData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    const fetchActiveDashers = async () => {
      try {
        const response = await axios.get('/dashers/active');
        const dasherUser = await Promise.all(response.data.map(async dasher => {
          const dasherUserResponse = await axios.get(`/users/${dasher.id}`);
          const dasherData = dasherUserResponse.data;
          return { ...dasher, dasherData };
        }));
        setActiveDashers(dasherUser);
      } catch (error) {
        console.error('Error fetching active dashers:', error);
      }
    };
    
    fetchOrders();
    fetchActiveDashers();
  }, []);

  const toggleAccordion = (orderId) => {
    setIsAccordionOpen((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId]
    }));
  };

  const handleDeclineClick = (orderId) => {
    setSelectedOrder(orderId);
    setIsDeclineModalOpen(true);
  };

  const closeModal = () => {
    setIsDeclineModalOpen(false);
    setSelectedOrder(null);
  };

  const confirmDecline = async () => {
    // Handle decline order logic here
    try {
      console.log('Declining order:', selectedOrder);
      // Make a POST request to update the order status
      await axios.post('/orders/update-order-status', { orderId: selectedOrder, status: 'declined' });
      // Optionally, you can also update the local state if needed
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.id === selectedOrder) {
            return { ...order, status: 'declined' };
          } else {
            return order;
          }
        });
      });
      alert('Order status declined successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleSubmit = async (orderId) => {
    try {
      // Make a POST request to update the order status
      await axios.post('/orders/update-order-status', { orderId, status: 'active_waiting_for_dasher' });
      // Optionally, you can also update the local state if needed
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.id === orderId) {
            return { ...order, status: 'active_waiting_for_dasher' };
          } else {
            return order;
          }
        });
      });
      alert('Order status updated successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="ao-body">
        <div className="ao-title">
          <h2>Incoming Orders</h2>
        </div>
        {orders.length === 0 && <div className="ao-no-orders">No incoming orders...</div>}
        {orders.map((order) => (
          <div key={order.id} className="ao-content-current">
            <div className="ao-card-current ao-card-large">
              <div className="ao-card-content" onClick={() => toggleAccordion(order.id)}>
                <div className="ao-order-img-holder">
                  <img src='/Assets/Panda.png' alt="food" className="ao-order-img" />
                </div>
                <div className="ao-card-text">
                  <h3>{`${order.firstName} ${order.lastName}`}</h3>
                  <p>{`Order #${order.id}`}</p>
                  <p>{order.paymentMethod=== 'gcash'? 'Online Payment' : 'Cash on Delivery'}</p>
                </div>
                <div className="ao-buttons">
                  <button className="p-logout-button" onClick={() => handleDeclineClick(order.id)}>Decline</button>
                  <button className="p-save-button" onClick={() => handleSubmit(order.id)}>Accept Order</button>
                </div>
                <div className="ao-toggle-content">
                  <FontAwesomeIcon icon={faAngleDown} rotation={isAccordionOpen[order.id] ? 180 : 0} />
                </div>
              </div>
              {isAccordionOpen[order.id] && (
                <div className="ao-accordion">
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
                        <h4>
                          ₱{order.totalPrice && order.shopData ? (order.totalPrice + order.shopData.deliveryFee).toFixed(2) : ''}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="ao-progress-modal">
            <h3 className="ao-modal-title">Active Dashers</h3>
            
            <div className="ao-modal-body">
            {activeDashers.length === 0 && <div>No active dashers...</div>}
                <div className="ao-items">
                {activeDashers.map((dasher, index) => (
                    <div key={index} className="ao-item">
                    <div className="ao-item-left">
                        <div className="ao-item-title">
                        <h4>{dasher.dasherData.firstname} {dasher.dasherData.lastname}</h4>
                        <p>{dasher.status}</p>
                        </div>
                    </div>
                    <div className="cm-item-right">
                        {/* Additional content for right side if needed */}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>

        <DeclineOrderModal 
          isOpen={isDeclineModalOpen}
          closeModal={closeModal}
          confirmDecline={confirmDecline}
        />
      </div>
    </>
  );
}

export default AdminIncomingOrder;
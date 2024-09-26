import React, { useEffect, useState } from "react";
import axios from "../utils/axiosConfig";
import "./css/ShopOrders.css"; // Updated CSS file
import { useAuth } from "../utils/AuthContext";
import Navbar from "./Navbar/Navbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import DeclineOrderModal from './AdminDeclineOrderModal';

const ShopIncomingOrder = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);  // For Approving Orders
  const [pastOrders, setPastOrders] = useState([]);  // State for past orders
  const [ongoingOrders, setOngoingOrders] = useState([]);  // State for Ongoing Orders
  const [isAccordionOpen, setIsAccordionOpen] = useState({});
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/orders/active-waiting-for-shop'); // New endpoint for approving orders
        const ordersWithShopData = await Promise.all(response.data.map(async order => {
          const shopDataResponse = await axios.get(`/shops/${order.shopId}`);
          const shopData = shopDataResponse.data;
          return { ...order, shopData };
        }));
        setOrders(ordersWithShopData);
        console.log('Approving Orders:', ordersWithShopData);
      } catch (error) {
        console.error('Error fetching approving orders:', error);
      }
    };

    const fetchPastOrders = async () => {
      try {
        const response = await axios.get('/orders/past-orders'); // New endpoint for past orders
        const pastOrdersWithShopData = await Promise.all(response.data.map(async order => {
          const shopDataResponse = await axios.get(`/shops/${order.shopId}`);
          const shopData = shopDataResponse.data;
          return { ...order, shopData };
        }));
        setPastOrders(pastOrdersWithShopData);
        console.log('Past Orders:', pastOrdersWithShopData);
      } catch (error) {
        console.error('Error fetching past orders:', error);
      }
    };

    const fetchOngoingOrders = async () => {
      try {
        const response = await axios.get('/orders/ongoing-orders'); // New endpoint for ongoing orders
        const ongoingOrdersWithShopData = await Promise.all(response.data.map(async order => {
          const shopDataResponse = await axios.get(`/shops/${order.shopId}`);
          const shopData = shopDataResponse.data;
          return { ...order, shopData };
        }));
        setOngoingOrders(ongoingOrdersWithShopData);
        console.log('Ongoing Orders:', ongoingOrdersWithShopData);
      } catch (error) {
        console.error('Error fetching ongoing orders:', error);
      }
    };

    fetchOrders();
    fetchPastOrders();
    fetchOngoingOrders();
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
    try {
      console.log('Declining order:', selectedOrder);
      await axios.post('/orders/update-order-status', { orderId: selectedOrder, status: 'cancelled_by_shop' });
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.id === selectedOrder) {
            return { ...order, status: 'cancelled_by_shop' };
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
      await axios.post('/orders/update-order-status', { orderId, status: 'active_shop_confirmed' });
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.id === orderId) {
            return { ...order, status: 'active_shop_confirmed' };
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
          <h2>Approving Orders</h2>
        </div>
        {orders.length === 0 && <div className="ao-no-orders">No approving orders...</div>}
        {orders.map((order) => (
          <div key={order.id} className="ao-content-current">
            <div className="ao-card-current ao-card-large">
              <div className="ao-card-content" onClick={() => toggleAccordion(order.id)}>
                <div className="ao-order-img-holder">
                  <img src={order.shopData.imageUrl ? order.shopData.imageUrl : '/Assets/Panda.png'} alt="food" className="ao-order-img" />
                </div>
                <div className="ao-card-text">
                  <h3>{`${order.firstname} ${order.lastname}`}</h3>
                  <p>{`Order #${order.id}`}</p>
                  <p>{order.paymentMethod === 'gcash' ? 'Online Payment' : 'Cash on Delivery'}</p>
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
                        <h4>₱{order.totalPrice && order.shopData ? (order.totalPrice + order.shopData.deliveryFee).toFixed(2) : ''}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Ongoing Orders Section */}
        <div className="ao-progress-modal">
          <h3 className="ao-modal-title">Ongoing Orders</h3>
          
          <div className="ao-modal-body">
          {ongoingOrders.length === 0 && <div>No ongoing orders...</div>}
            <div className="ao-items">
              {ongoingOrders.map((order) => (
                <div key={order.id} className="ao-item">
                  <div className="ao-item-left">
                    <div className="ao-item-title">
                      <h4>{order.firstname} {order.lastname}</h4>
                      <p>{`Order #${order.id}`}</p>
                      <p>{order.paymentMethod === 'gcash' ? 'Online Payment' : 'Cash on Delivery'}</p>
                    </div>
                  </div>
                  <div className="ao-item-right">
                    <button className="ao-toggle-content" onClick={() => toggleAccordion(order.id)}>
                      <FontAwesomeIcon icon={faAngleDown} rotation={isAccordionOpen[order.id] ? 180 : 0} />
                    </button>
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
                            <h4>₱{order.totalPrice && order.shopData ? (order.totalPrice + order.shopData.deliveryFee).toFixed(2) : ''}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ao-title">
          <h2>Past Orders</h2>
        </div>
        {pastOrders.length === 0 && <div className="ao-no-orders">No past orders...</div>}
        {pastOrders.map((order) => (
          <div key={order.id} className="ao-content-past">
            <div className="ao-card-past ao-card-large">
              <div className="ao-card-content">
                <div className="ao-order-img-holder">
                  <img src={order.shopData.imageUrl ? order.shopData.imageUrl : '/Assets/Panda.png'} alt="food" className="ao-order-img" />
                </div>
                <div className="ao-card-text">
                  <h3>{`${order.firstname} ${order.lastname}`}</h3>
                  <p>{`Order #${order.id}`}</p>
                  <p>{order.paymentMethod === 'gcash' ? 'Online Payment' : 'Cash on Delivery'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        <DeclineOrderModal 
          isOpen={isDeclineModalOpen}
          closeModal={closeModal}
          confirmDecline={confirmDecline}
        />
      </div>
    </>
  );
}

export default ShopIncomingOrder;

import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import axios from "../utils/axiosConfig";
import DeclineOrderModal from './AdminDeclineOrderModal';
import "./css/ShopOrders.css"; // Updated CSS file

const ShopIncomingOrder = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);  // For Approving Orders
  const [pastOrders, setPastOrders] = useState([]);  // State for past orders
  const [ongoingOrders, setOngoingOrders] = useState([]);  // State for Ongoing Orders
  const [isAccordionOpen, setIsAccordionOpen] = useState({});
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);


  
  // approving orders only for gcash
   const fetchOrders = async () => {
      try {
        const response = await axios.get('/orders/active-waiting-for-shop'); // New endpoint for approving orders
        const ordersWithShopData = await Promise.all(response.data.map(async order => {
          const shopDataResponse = await axios.get(`/shops/${order.shopId}`);
          const shopData = shopDataResponse.data;
          console.log(shopData)
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

        const filteredPastOrders = pastOrdersWithShopData.filter(order => order.shopId === currentUser.id);

        setPastOrders(filteredPastOrders);
      } catch (error) {
        console.error('Error fetching past orders:', error);
      }
    };

    //ongoing orders = dashers taking the order and delvering
    const fetchOngoingOrders = async () => {
      try {
        const response = await axios.get('/orders/ongoing-orders'); // New endpoint for ongoing orders
        const ongoingOrdersWithShopData = await Promise.all(response.data.map(async order => {
          const shopDataResponse = await axios.get(`/shops/${order.shopId}`);
          const shopData = shopDataResponse.data;
          return { ...order, shopData };
        }));

        const filteredOngoingOrders = ongoingOrdersWithShopData.filter(order => order.shopId === currentUser.id);
        setOngoingOrders(filteredOngoingOrders);
        console.log('Ongoing Orders:', ongoingOrdersWithShopData);
      } catch (error) {
        console.error('Error fetching ongoing orders:', error);
      }
    };

  useEffect(() => {
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

  const handleDeclineClick = (order) => {
    setSelectedOrder(order);
    setIsDeclineModalOpen(true);
  };

  const closeModal = () => {
    setIsDeclineModalOpen(false);
    setSelectedOrder(null);
  };

  const confirmDecline = async () => {
  try {
    console.log('Declining order:', selectedOrder);

    let newStatus = '';
    // this code is for cash payment
    // if(selectedOrder.paymentMethod === 'cash'){
    //         if (selectedOrder.dasherId !== null) {
    //             newStatus = 'active_waiting_for_shop_cancel_confirmation';
    //         } else {
    //             newStatus = 'cancelled_by_shop';  
    //         }
    //         const updateResponse = await axios.post('/orders/update-order-status', {
    //             orderId: selectedOrder.id,
    //             status: newStatus
    //         });

    //           if (updateResponse.status === 200) {
    //             console.log('Order cancelled successfully');
    //             closeModal();
    //           fetchOrders();
    //         }
    //       }else{
    



    //opens dasher cancel by shop on the dasher screen to alert that shop has cancelled the order
    if(selectedOrder.dasherId !== null){
      newStatus = 'active_waiting_for_shop_cancel_confirmation';
    } else {
      newStatus = 'cancelled_by_shop';
    }
  
    await axios.post('/orders/update-order-status', { orderId: selectedOrder.id, status: newStatus });

    const referenceNumber = selectedOrder.id

    if (!referenceNumber) {
      alert("No reference number found for this order.");
      return;
    }

    // Retrieve the payment details using the reference number
    const paymentResponse = await axios.get(`/payments/get-payment-by-reference/${referenceNumber}`);
    const paymentId = paymentResponse.data.payment_id;
    console.log('paymentResponse:', paymentResponse.data.payment_id);

    // If payment ID is found, proceed to initiate the refund
    if (paymentId) {
      const refundPayload = {
        paymentId: paymentId,
        amount: selectedOrder.totalPrice + selectedOrder.deliveryFee, // Amount to refund (in PHP)
        reason: "others", // This can be adjusted based on your use case
        notes: "Refund initiated by admin."
      };

      const refundResponse = await axios.post("/payments/process-refund", refundPayload);
      
      console.log('refundResponse:', refundResponse);
      alert("Refund successful!");
      // Update the orders state
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.id === selectedOrder.id) {
            return { ...order, status: 'cancelled_by_shop' };
          } else {
            return order;
          }
        });
      });
            window.location.reload();
  }
  } catch (error) {
    console.error('Error declining order:', error);
    alert("An error occurred while declining the order. Please try again.");
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
                  <button className="p-logout-button" onClick={() => handleDeclineClick(order)}>{order.paymentMethod === 'gcash' ? 'Decline and Refund' : 'Decline'}</button>
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

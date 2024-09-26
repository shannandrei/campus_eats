import React from "react";
import { useState, useEffect } from "react";
import "./css/Order.css";
import { useAuth } from "../utils/AuthContext";
import Navbar from "./Navbar/Navbar";
import axios from "../utils/axiosConfig";
import ReviewModal from './ReviewModal'; // Adjust the path as needed
import ReviewShopModal from './ReviewShopModal'; // Import the ReviewShopModal
import CancelOrderModal from "./CancelOrderModal";
import RefundOrderModal from "./RefundOrderModal";

const Order = () => {
    const { currentUser } = useAuth();
    const [activeOrder, setActiveOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shop, setShop] = useState(null);
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReviewShopModalOpen, setIsReviewShopModalOpen] = useState(false); // State for ReviewShopModal
    const [selectedOrder, setSelectedOrder] = useState(null); // State for the selected order
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

    const fetchOrders = async () => {
        try {
            const ordersResponse = await axios.get(`/orders/user/${currentUser.id}`);
            if (ordersResponse.status !== 200) {
                throw new Error("Failed to fetch orders");
            }

            const ordersData = ordersResponse.data;
            const activeOrder = ordersData.activeOrders.length > 0 ? ordersData.activeOrders[0] : null;
            setActiveOrder(activeOrder);

            if (ordersData.activeOrders.length > 0) {
                switch (activeOrder.status) {
                    case 'active_waiting_for_admin':
                    case 'active_waiting_for_dasher':
                        setStatus('Order is being verified');
                        break;
                    case 'active_preparing':
                        setStatus('Order is being prepared');
                        break;
                    case 'active_onTheWay':
                        setStatus('Order is on the way');
                        break;
                    case 'active_delivered':
                        setStatus('Order has been delivered');
                        break;
                    case 'active_waiting_for_confirmation':
                        setStatus('Waiting for your confirmation');
                        setIsReviewModalOpen(true); // Open the modal
                        break;
                    case 'active_pickedUp':
                        setStatus('Order has been picked up');
                        break;
                    case 'active_toShop':
                        setStatus('Dasher is on the way to the shop');
                        break;
                    case 'cancelled_by_customer': 
                        setStatus('Order has been cancelled');
                        break;
                    case 'cancelled_by_dasher': 
                        setStatus('Order has been cancelled');
                        break;
                    case 'cancelled_by_shop': 
                        setStatus('Order has been cancelled');
                        break;
                    case 'active_shop_confirmed': 
                        setStatus('Order is being prepared');
                        break;
                    case 'active_waiting_for_shop': 
                        setStatus('Dasher is on the way to the shop');
                        break;
                    case 'refunded': 
                        setStatus('Order has been refunded');
                        break;
                    case 'active_waiting_for_cancel_confirmation': 
                        setStatus('Order is waiting for cancellation confirmation');
                        break;
                    default:
                        setStatus('Unknown status');
                }
            }

            const ordersShopData = await Promise.all(
                ordersData.orders.map(async (order) => {
                    const ordersShopDataResponse = await axios.get(`/shops/${order.shopId}`);
                    const ordersShop = ordersShopDataResponse.data;
                    return { ...order, shopData: ordersShop }; 
                })
            );

            setOrders(ordersShopData);
            
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchShopData = async (id) => {
        try {
            const response = await axios.get(`/shops/${id}`);
            if (response.status !== 200) {
                throw new Error('Failed to fetch shop data');
            }
            const data = response.data;
            setShop(data);
        } catch (error) {
            console.error('Error fetching shop data:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [currentUser]);

    useEffect(() => {
        setLoading(true);
        if (activeOrder && activeOrder.shopId) {
            fetchShopData(activeOrder.shopId);
        }
        setLoading(false);
    }, [activeOrder]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchOrders();
        }, 10000); // Fetch every 10 seconds

        return () => clearInterval(intervalId); // Clear interval on unmount
    }, []);

    // Function to open the ReviewShopModal
    const handleOpenReviewShopModal = (order) => {
        setSelectedOrder(order);
        setIsReviewShopModalOpen(true);
    };

    const handleCancelOrder = () => {
        setIsCancelModalOpen(true); 
    };
    const closeCancelModal = () => {
        setIsCancelModalOpen(false); 
    };
    const handleRefundOrder = () => {
        setIsRefundModalOpen(true); 
    };
    const hideRefundButton = status === 'Order is being prepared'
        || status === 'Order has been picked up'
        || status === 'Order is on the way'  
        || status === 'Order has been delivered'  
        || status === 'Order has been completed'
        || status === 'Order is waiting for cancellation confirmation'
        || status === 'Waiting for your confirmation';
    const hideCancelButton = status === 'Order is being prepared'
        || status === 'Order has been picked up'
        || status === 'Order is on the way' 
        || status === 'Order has been delivered' 
        || status === 'Order has been completed'
        || status === 'Order is waiting for cancellation confirmation'
        || status === 'Waiting for your confirmation';
    return (
        <>
            <Navbar />
            <div className="o-body">
            {isReviewModalOpen && (
                <ReviewModal 
                    isOpen={isReviewModalOpen} 
                    order={activeOrder}
                    shop={shop}
                    onClose={() => setIsReviewModalOpen(false)} 
                />
            )}
            {isReviewShopModalOpen && (
                <ReviewShopModal
                    isOpen={isReviewShopModalOpen}
                    order={selectedOrder}
                    shop={selectedOrder?.shopData}
                    onClose={() => setIsReviewShopModalOpen(false)}
                />
            )}
            {isCancelModalOpen && (
                <CancelOrderModal
                    isOpen={isCancelModalOpen}  
                    closeModal={closeCancelModal}  
                    shopData={shop} 
                    orderData={activeOrder} 
                />
            )}
            {isRefundModalOpen && (
                <RefundOrderModal
                    isOpen={isRefundModalOpen}  
                    closeModal={() => setIsRefundModalOpen(false)}
                    orderData={activeOrder} 
                />
            )}
                <div className="o-title">
                    <h2>Active Order</h2>
                </div>
                {loading ? (
                    <p>Loading...</p>
                ) : activeOrder ? (
                <div className="o-content-current">
                    <div className="o-card-current o-card-large">
                        <div className="o-text">
                            <h2>Order Details</h2>
                            <div className="o-order-content">
                                <div className="o-order-img-holder">
                                    <img src={shop ? shop.imageUrl : '/Assets/Panda.png'} alt="food" className="o-order-img"/>
                                </div>
                                <div className="o-order-details">
                                    <div className="o-order-text">
                                        <h3>{shop ? shop.name : ''}</h3>
                                        <p>{shop ? shop.address : ''}</p>
                                        <div className="o-order-subtext">
                                            <p>Delivery Location</p> 
                                            <h4>{activeOrder ? activeOrder.deliverTo : ''}</h4>
                                            <p>Order number</p> 
                                            <h4>#{activeOrder ? activeOrder.id : ''}</h4>
                                            <p>Payment Method</p> 
                                            <h4>{activeOrder ? activeOrder.paymentMethod : ''}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="o-order-summary">
                                <h3>Order Summary</h3>
                                {activeOrder.items.map((item, index) => (
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
                                        <h4>₱{activeOrder.totalPrice.toFixed(2)}</h4>
                                    </div>
                                    <div className="o-order-summary-subtotal">
                                        <h4>Delivery Fee</h4>
                                        <h4>₱{shop ? shop.deliveryFee.toFixed(2) : ''}</h4>
                                    </div>
                                    <div className="o-order-summary-total">
                                        <h4>Total</h4>
                                        <h4>
                                        ₱{activeOrder.totalPrice && shop ? (activeOrder.totalPrice + shop.deliveryFee).toFixed(2) : ''}
                                        </h4>
                                    </div>
                                </div>
                                {activeOrder && (
                                    <div className="refund-cancel-order-container">
                                        {activeOrder.paymentMethod === 'gcash' && !hideRefundButton && (
                                            <button className="refund-order-btn" onClick={handleRefundOrder}>
                                                Cancel and Refund
                                            </button>
                                        )}
                                        {activeOrder.paymentMethod === 'cash' && !hideCancelButton && (
                                            <button className="cancel-order-btn" onClick={handleCancelOrder}>
                                                Cancel Order
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="o-card-current o-card-small">
                        <div className="o-text">
                            <div className="loader">
                                <div className="circle">
                                    <div className="dot"></div>
                                    <div className="outline"></div>
                                </div>
                                <div className="circle">
                                    <div className="dot"></div>
                                    <div className="outline"></div>
                                </div>
                                <div className="circle">
                                    <div className="dot"></div>
                                    <div className="outline"></div>
                                </div>
                                <div className="circle">
                                    <div className="dot"></div>
                                    <div className="outline"></div>
                                </div>
                            </div>
                            <div className="o-subtext-current">
                                <h4>{status ? status : ''}</h4>
                            </div>
                        </div>
                        <img src='/Assets/active-img.png' alt="food" className="o-left-current-img"/>
                    </div>
                </div>
                ) : (
                    <p>No active orders found.</p>
                )}
                <div className="o-title">
                    <h2>Past Orders</h2>
                </div>

                <div className="o-content-past">
                    {orders.map((order, index) => (
                        <div 
                            className="o-card-past" 
                            key={index}
                            onClick={() => handleOpenReviewShopModal(order)} // Make the order clickable
                        >
                            <div className="o-past-img-holder">
                                <img src={order.shopData.imageUrl ? order.shopData.imageUrl : '/Assets/Panda.png'} alt="food" className="o-past-img"/>
                            </div>
                            <div className="o-past-details">
                                <div className="o-past-text">
                                    <div className="o-past-total">
                                        <div className="o-past-title">
                                            <h3>{order.shopData.name}</h3>
                                            <p>{order.shopData.address}</p>
                                        </div>
                                        <h4>₱{order.totalPrice.toFixed(2)}</h4>
                                    </div>
                                    <div className="o-past-subtext">
                                        <p>
                                            {order.status === 'cancelled_by_shop'
                                                ? 'Order was cancelled by shop'
                                                : order.status === 'cancelled_by_customer'
                                                ? 'Order was cancelled by customer'
                                                : order.status === 'cancelled_by_dasher'
                                                ? 'Order was cancelled by dasher'
                                                : order.status === 'refunded'
                                                ? 'Order was refunded'
                                                : `Delivered on ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                                        </p>
                                        <p>Order #{order.id}</p>
                                        <p>{order.paymentMethod === 'cash' ? 'Cash On Delivery' : 'GCASH'}</p> 
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Order;

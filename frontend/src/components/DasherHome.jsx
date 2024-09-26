import React, { useState, useEffect } from "react";
import axios from '../utils/axiosConfig'; // Import axiosConfig
import "./css/DasherHome.css";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import DasherCompletedModal from "./DasherCompletedModal";
import DasherCancelOrderModal from "./DasherCancelOrderModal";
import DasherCancelByDasherModal from "./DasherCancelByDasherModal";

const DasherHome = () => {
    const { currentUser } = useAuth();
    // const [isActive, setIsActive] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);
    const [shop, setShop] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const [currentStatus, setCurrentStatus] = useState("");
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [dasherCancelModalOpen, setDasherCancelModalOpen] = useState(false);
    const [buttonClicked, setButtonClicked] = useState({
        toShop: false,
        preparing: false,
        pickedUp: false,
        onTheWay: false,
        delivered: false,
        completed: false
    });
    

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const ordersResponse = await axios.get(`/orders/dasher/all-orders-list/${currentUser.id}`);
                if (!ordersResponse.data) {
                    throw new Error("Failed to fetch orders");
                }
                
                const ordersData = ordersResponse.data;
                const activeOrderHold = ordersData.activeOrders.length > 0 ? ordersData.activeOrders[0] : null;
                setActiveOrder(activeOrderHold);
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

        fetchOrders();
    }, [currentUser]);

    useEffect(() => {
        const fetchShopData = async () => {
            if (activeOrder && activeOrder.shopId) {
                setLoading(true);
                try {
                    const response = await axios.get(`/shops/${activeOrder.shopId}`);
                    setShop(response.data);
                } catch (error) {
                    console.error('Error fetching shop data:', error);
                }
                setLoading(false);
            }
        };

        if (activeOrder && activeOrder.status) {
            const adjustedStatus = activeOrder.status === "active_waiting_for_confirmation" 
                ? "delivered" 
                : ["active_waiting_for_shop", "active_shop_confirmed"].includes(activeOrder.status) 
                ? "toShop" 
                : activeOrder.status.replace("active_", "");
            setCurrentStatus(adjustedStatus);
            setButtonClicked(prevState => ({
                ...prevState,
                [adjustedStatus]: true
            }));
        }
        fetchShopData();
    }, [activeOrder]);

    // const toggleButton = () => {
    //     setIsActive(!isActive);
    // };
    useEffect(() => {
        let intervalId;
        if (activeOrder) {
            intervalId = setInterval(async () => {
                try {
                    const response = await axios.get(`/orders/${activeOrder.id}`);
                    const updatedOrder = response.data;
                    console.log('updatedOrder:', updatedOrder);
                    setActiveOrder(updatedOrder);
                    // Check if the status changed to active_waiting_for_cancel_confirmation
                    if (updatedOrder.status === "active_waiting_for_cancel_confirmation") {
                        setCancelModalOpen(true);  // Open the Cancel Order Modal
                    }
                } catch (error) {
                    console.error('Error checking order status:', error);
                }
            }, 5000); // Check every 5 seconds
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [activeOrder]);

    const updateOrderStatus = async (newStatus) => {
        try {
            const response = await axios.post('/orders/update-order-status', {
                orderId: activeOrder.id,
                status: `active_${newStatus}`   
            });
            if (response.status === 200) {
                // Handle successful status update
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    

    const handleStatusChange = (newStatus) => {
        if (newStatus === "completed") {
            setIsModalOpen(true);
        } else {
            // Check conditions for status changes
            console.log('currentStatus:', currentStatus);
                console.log('activeOrder status:', activeOrder.status);
                console.log('activeOrder paymentMethod:', activeOrder.paymentMethod);
            console.log('newStatus:', newStatus);
            if (newStatus === "toShop" && !buttonClicked.toShop) {
                setCurrentStatus(newStatus);
                setButtonClicked(prevState => ({
                    ...prevState,
                    [newStatus]: true
                }));
                updateOrderStatus(newStatus);
            } else if (newStatus === "preparing") {
                
                if (currentStatus === "toShop" && activeOrder.paymentMethod === "cash") {
                    setCurrentStatus(newStatus);
                    setButtonClicked(prevState => ({
                        ...prevState,
                        [newStatus]: true
                    }));
                    updateOrderStatus(newStatus);
                } else if (currentStatus === "toShop" && activeOrder.status === "active_shop_confirmed" && activeOrder.paymentMethod === "gcash") {
                    setCurrentStatus(newStatus);
                    setButtonClicked(prevState => ({
                        ...prevState,
                        [newStatus]: true
                    }));
                    updateOrderStatus(newStatus);
                } else {
                    alert("Please wait for the shop to confirm the order before marking it as 'preparing'.");
                }
            } else if (newStatus === "pickedUp") {
                if (buttonClicked.preparing && !buttonClicked.pickedUp) {
                    setCurrentStatus(newStatus);
                    setButtonClicked(prevState => ({
                        ...prevState,
                        [newStatus]: true
                    }));
                    updateOrderStatus(newStatus);
                } else {
                    alert("You must mark the order as 'preparing' before you can mark it as 'picked up'.");
                }
            } else if (newStatus === "onTheWay") {
                if (buttonClicked.pickedUp && !buttonClicked.onTheWay) {
                    setCurrentStatus(newStatus);
                    setButtonClicked(prevState => ({
                        ...prevState,
                        [newStatus]: true
                    }));
                    updateOrderStatus(newStatus);
                } else {
                    alert("You must mark the order as 'picked up' before you can mark it as 'on the way'.");
                }
            } else if (newStatus === "delivered") {
                if (buttonClicked.onTheWay && !buttonClicked.delivered) {
                    setCurrentStatus(newStatus);
                    setButtonClicked(prevState => ({
                        ...prevState,
                        [newStatus]: true
                    }));
                    updateOrderStatus(newStatus);
                } else {
                    alert("You must mark the order as 'on the way' before you can mark it as 'delivered'.");
                }
            } else {
                alert("Invalid status change. Please check your current status and try again.");
            }
        }
    };
    

    const showCancelModal = () => {
        setDasherCancelModalOpen(true);
    };
    
    return (
        <>
            
            <div className="j-body">
                <div className="j-title">
                    <h2>Active Order</h2>
                </div>
                {activeOrder ? (
                <div className="j-content-current">
                    <div className="j-card-current j-card-large">
                        <div className="j-text">
                            <h2>Order Details</h2>
                            <div className="j-order-content">
                                <div className="j-order-img-holder">
                                    <img src={shop ? shop.imageUrl : '/Assets/Panda.png'} alt="shop" className="j-order-img" />
                                </div>
                                <div className="j-order-details">
                                    <div className="j-order-text">
                                        <h3>{shop ? shop.name: 'No Shop Found'}</h3>
                                        <p>{shop ? shop.address: 'No Shop Found'}</p>
                                        <div className="j-order-subtext">
                                            <p>Delivery Location</p>
                                            <h4>{activeOrder ? activeOrder.deliverTo: ''}</h4>
                                            <p>Order number</p>
                                            <h4>#{activeOrder ? activeOrder.id: ''}</h4>
                                            <p>Payment Method</p>
                                            <h4>{activeOrder ? activeOrder.paymentMethod: ''}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="j-order-summary">
                                <h3>Order Summary</h3>
                                {activeOrder ? activeOrder.items.map((item, index) => (
                                    <div key={index} className="j-order-summary-item">
                                        <div className="j-order-summary-item-header">
                                            <p>{item.quantity}x</p>
                                            <p>{item.name}</p>
                                        </div>
                                        <p>₱{item.price.toFixed(2)}</p>
                                    </div>
                                )): ''}
                                <div className="j-order-summary-total-container">
                                    <div className="j-order-summary-subtotal">
                                        <h4>Subtotal</h4>
                                        <h4>₱{activeOrder ? activeOrder.totalPrice.toFixed(2): ''}</h4>
                                    </div>
                                    <div className="j-order-summary-subtotal">
                                        <h4>Delivery Fee</h4>
                                        <h4>₱{shop? shop.deliveryFee.toFixed(2): ''}</h4>
                                    </div>
                                    <div className="j-order-summary-total">
                                        <h4>Total </h4>
                                        <h4>₱{(activeOrder && shop)? (activeOrder.totalPrice + shop.deliveryFee).toFixed(2): ''}</h4>
                                    </div>
                                </div>
                                <div className="j-order-status-container">
                                    <p>Status</p>
                                    <div className="j-order-status-buttons">
                                        <button disabled={buttonClicked.toShop || currentStatus !== ""} className={`j-status-button toShop ${currentStatus === "toShop" ? "active": ""}`} onClick={() => handleStatusChange("toShop")}>
                                            On the way to the Shop {currentStatus === "toShop" && "✓"}
                                        </button>
                                        <button disabled={!buttonClicked.toShop || buttonClicked.preparing || currentStatus !== "toShop"} className={`j-status-button preparing ${currentStatus === "preparing" ? "active" : ""}`} onClick={() => handleStatusChange("preparing")}>
                                            Preparing {currentStatus === "preparing" && "✓"}
                                        </button>
                                        <button disabled={!buttonClicked.preparing || buttonClicked.pickedUp || currentStatus !== "preparing"} className={`j-status-button pickedUp ${currentStatus === "pickedUp" ? "active" : ""}`} onClick={() => handleStatusChange("pickedUp")}>
                                            Picked Up {currentStatus === "pickedUp" && "✓"}
                                        </button>
                                        <button disabled={!buttonClicked.pickedUp || buttonClicked.onTheWay || currentStatus !== "pickedUp"} className={`j-status-button onTheWay ${currentStatus === "onTheWay" ? "active" : ""}`} onClick={() => handleStatusChange("onTheWay")}>
                                            On the way {currentStatus === "onTheWay" && "✓"}
                                        </button>
                                        <button disabled={!buttonClicked.onTheWay || buttonClicked.delivered || currentStatus !== "onTheWay"} className={`j-status-button delivered ${currentStatus === "delivered" ? "active" : ""}`} onClick={() => handleStatusChange("delivered")}>
                                            Delivered {currentStatus === "delivered" && "✓"}
                                        </button>
                                        <button disabled={!buttonClicked.delivered || buttonClicked.completed || currentStatus !== "delivered"} className={`j-status-button completed ${currentStatus === "completed" ? "active" : ""}`} onClick={() => handleStatusChange("completed")}>
                                            Completed {currentStatus === "completed" && "✓"}
                                        </button>
                                    </div>
                                </div>
                                <div className="refund-cancel-order-container">
                                    {currentStatus === "toShop" && (
                                        <button className="cancel-order-btn" style={{width: '200px', textAlign: 'center'}} onClick={showCancelModal}>
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                ): (
                    <div>No active order...</div> 
                )}
                
                <div className="j-title">
                    <h2>Past Orders</h2>
                </div>
                {orders.length === 0 && <div className="j-no-orders">No past orders...</div>}
                <div className="j-content-past">
                    {orders.map((order, index) => (
                    <div className="j-card-past" key={index}>
                        <div className="j-past-img-holder">
                        <img src={order.shopData.imageUrl ? order.shopData.imageUrl : '/Assets/Panda.png'} alt="food" className="o-past-img"/>
                        </div>
                        <div className="j-past-details">
                            <div className="j-past-text">
                                <div className="j-past-total">
                                    <div className="j-past-title">
                                        <h3>{order.shopData.name}</h3>
                                        <p>{order.shopData.name}</p>
                                    </div>
                                    <h4>₱{order.totalPrice.toFixed(2)}</h4>
                                </div>
                                <div className="j-past-subtext">
                                    <div className="j-past-subtext-right">
                                    <p>
                                        {order.status.startsWith('cancelled')
                                            ? 'Order was cancelled'
                                            : order.status === 'refunded'
                                            ? 'Order was refunded'
                                            : `Delivered on ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                                    </p>
                                        <p>Order #{order.id}</p>
                                        <p>Paid {order.paymentMethod}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
            {isModalOpen && (
                <DasherCompletedModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false) } shopData={shop} orderData={activeOrder}/>
            )}
            {/* CancelOrderModal */}
            {cancelModalOpen && (
                <DasherCancelOrderModal 
                    isOpen={cancelModalOpen} 
                    closeModal={() => setCancelModalOpen(false)} 
                    shopData={shop} 
                    orderData={activeOrder} 
                />
            )}
            {dasherCancelModalOpen && (
                    <DasherCancelByDasherModal 
                    isOpen={dasherCancelModalOpen} 
                    closeModal={() => setDasherCancelModalOpen(false)} 
                    shopData={shop} 
                    orderData={activeOrder}  />
                )}
        </>
    );
};

export default DasherHome;

import React, { useEffect, useState } from "react";
import axios from "../utils/axiosConfig"; // Updated import statement
import { useAuth } from "../utils/AuthContext";
import Navbar from "./Navbar/Navbar";
import "./css/AdminOrderHistory.css"; // Import CSS file

const AdminOrderHistory = () => {
    const { currentUser } = useAuth();
    const [completedOrders, setCompletedOrders] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);

    useEffect(() => {
        const fetchCompletedOrders = async () => {
            try {
                const response = await axios.get('/orders/completed-orders'); // Updated endpoint path
                const { completedOrders, activeOrders } = response.data; // Destructuring response data
                
                const completedOrdersData = await Promise.all(
                    completedOrders.map(async (order) => {
                        const userResponse = await axios.get(`/users/${order.uid}`);
                        const userData = userResponse.data;
                        return { ...order, userData };
                    })
                );
              
                const activeOrdersData = await Promise.all(
                    activeOrders.map(async (order) => {
                        const userResponse = await axios.get(`/users/${order.uid}`);
                        const userData = userResponse.data;
                        return { ...order, userData };
                    })
                );
              
                setCompletedOrders(completedOrdersData);
                setActiveOrders(activeOrdersData);
                console.log("completedOrdersData", completedOrdersData);
                console.log("activeOrdersData", activeOrdersData);
          
            } catch (error) {
                console.error('Error fetching completed orders:', error);
            }
        };

        fetchCompletedOrders();
    }, []);

    // Helper function to format Firestore timestamp
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <>
            <Navbar />
            <div className="aoh-body">
                <div className="aoh-title">
                    <h2>Active Orders</h2>
                </div>
                {activeOrders && activeOrders.length > 0 ? (
                    <>
                <div className="aoh-row-container">
                    <div className="aoh-word">Order ID#</div>
                    <div className="aoh-word">Customer</div>
                    <div className="aoh-word">Created</div>
                    <div className="aoh-word">Runner</div>
                    <div className="aoh-word">Customer Total</div>
                    <div className="aoh-word">Status</div>
                </div>

                <div className="aoh-scontainer">
                    {activeOrders.map(order => (
                        <div key={order.id} className="aoh-box">
                            <div className="aoh-box-content">
                                <div>{order.id}</div>
                                <div>{order.userData?.username}</div> {/* Optional chaining to avoid errors */}
                                <div>{order.createdAt ? formatDate(order.createdAt) : 'N/A'}</div>
                                <div>{order.runner}</div>
                                <div>₱{order.totalPrice}</div>
                                <div>{order.status}</div>
                            </div>
                        </div>
                    ))}
                </div>
                </>
                ) : (
                    <div>No active orders</div>
                )}

                <div className="aoh-title">
                    <h2>Orders History</h2>
                </div>
                {completedOrders && completedOrders.length > 0 ? (
                    <>
                <div className="aoh-row-container">
                    <div className="aoh-word">Order ID#</div>
                    <div className="aoh-word">Customer</div>
                    <div className="aoh-word">Created</div>
                    <div className="aoh-word">Runner</div>
                    <div className="aoh-word">Customer Total</div>
                    <div className="aoh-word">Status</div>
                </div>

                <div className="aoh-scontainer">
                    {completedOrders.map(order => (
                        <div key={order.id} className="aoh-box">
                            <div className="aoh-box-content">
                                <div>{order.id}</div>
                                <div>{order.userData?.username}</div> {/* Optional chaining to avoid errors */}
                                <div>{order.createdAt ? formatDate(order.createdAt) : 'N/A'}</div>
                                <div>{order.runner}</div>
                                <div>₱{order.totalPrice}</div>
                                <div>{order.status}</div>
                            </div>
                        </div>
                    ))}
                </div>
                </>
                ) : (
                    <div>No past orders...</div>
                )}
            </div>
        </>
    )
}

export default AdminOrderHistory;

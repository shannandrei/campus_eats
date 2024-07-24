import React, { useState, useEffect } from "react";
import "./css/CartModal.css";
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';

const CartModal = ({ showModal, onClose }) => {
    const { currentUser } = useAuth();
    const [cartData, setCartData] = useState(null);
    const [shopData, setShopData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const response = await axios.get(`/carts/cart`, {
                    params: { uid: currentUser.id }
                });
                setCartData(response.data);
            } catch (error) {
                console.error('Error fetching cart data:', error);
            }
        };

        if (showModal && currentUser) {
            fetchCartData();
        }
    }, [showModal, currentUser]);

    useEffect(() => {
        const fetchShopData = async () => {
            if (cartData && cartData.id) {
                try {
                    const response = await axios.get(`/shops/${cartData.id}`);
                    setShopData(response.data);
                } catch (error) {
                    console.error('Error fetching shop data:', error);
                }
            }
        };

        fetchShopData();
    }, [cartData]);

    const updateCartItem = async (itemId, action) => {
        try {
            const response = await axios.post('/carts/update-cart-item', {
                uid: currentUser.id,
                itemId,
                action
            });

            setCartData(response.data.cartData);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert('Quantity limit reached');
            } else {
                alert(`Error: ${error.message}`);
            }
        }
    };

    const handleItemIncrease = (item) => {
        updateCartItem(item.id, 'increase');
    };

    const handleItemDecrease = (item) => {
        updateCartItem(item.id, 'decrease');
    };

    const handleItemRemove = (item) => {
        if (window.confirm(`Are you sure you want to remove ${item.name} from your cart?`)) {
            updateCartItem(item.id, 'remove');
        }
    };

    const handleShopRemove = async () => {
        if (window.confirm(`Are you sure you want to remove ${shopData.shopName}? This will remove all items in your cart.`)) {
            try {
                const response = await axios.delete('/carts/remove-cart', {
                    data: { uid: currentUser.id }
                });

                alert(response.data.message);
                setCartData(null);
            } catch (error) {
                console.error('Error removing cart:', error);
            }
        }
    };

    const handleProceedToCheckout = () => {
        navigate(`/checkout/${currentUser.id}/${cartData.id}`);
    };

    return (
        <div className={`cart-modal ${showModal ? 'show' : ''}`}>
            <div className="cm-modal">
                <div className="cm-modal-divider">
                    <div className="cm-modal-header">
                        {!cartData || cartData.items.length === 0 ? (
                            <>
                                <h3 className="cm-modal-title">Your cart is empty...</h3>
                            </>
                        ) : (
                            <>
                                <div className="cm-items">
                                    <div className="cm-store-item">
                                        <div className="cm-item-left">
                                            <img src={'/Assets/store-location-icon.png'} alt="store loc" className="cm-image-store" />
                                            <div className="cm-store-title">
                                                <h4>{shopData ? shopData.name : 'Store Name'}</h4>
                                                <p>{shopData ? shopData.address : 'Store Address'}</p>
                                            </div>
                                        </div>
                                        <div className="cm-item-right">
                                            <div className="cm-store-button">
                                                <Button className="cm-store-btn" onClick={handleShopRemove}>Remove</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="cm-modal-title">Your Items</h3>
                            </>
                        )}
                    </div>

                    <div className="cm-modal-body">
                        <div className="cm-items">
                            {cartData && cartData.items.map(item => (
                                <div className="cm-item" key={item.id}>
                                    <div className="cm-item-left">
                                        <div className="cm-item-buttons">
                                            <button className="cm-button" onClick={() => item.quantity > 1 ? handleItemDecrease(item) : handleItemRemove(item)}>
                                                {item.quantity > 1 && <FontAwesomeIcon icon={faMinus} />}
                                                {item.quantity <= 1 && <img src={'/Assets/remove-icon.png'} alt="remove" className="cm-image-remove" />}
                                            </button>
                                            <span className="cm-item-count">{item.quantity}</span>
                                            <button className="cm-button" onClick={() => handleItemIncrease(item)}>
                                                <FontAwesomeIcon icon={faPlus} />
                                            </button>
                                        </div>
                                        <div className="cm-item-title">
                                            <h4>{item.name}</h4>
                                            <p>More Description</p>
                                        </div>
                                    </div>
                                    <div className="cm-item-right">
                                        <p>₱{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="cm-modal-footer">
                    <div className="cm-subtotal">
                        <h5>Subtotal</h5>
                        <h4>₱{cartData ? cartData.totalPrice : '0.00'}</h4>
                    </div>
                    <div className="cm-subtotal">
                        <h5>Delivery Fee</h5>
                        <h4>₱{shopData ? shopData.deliveryFee : '0.00'}</h4>
                    </div>
                    <div className="cm-total">
                        <h5>Total</h5>
                        <h4>₱{cartData && shopData ? (cartData.totalPrice + shopData.deliveryFee).toFixed(2) : '0.00'}</h4>
                    </div>
                    <button
                        disabled={!cartData || cartData.items.length === 0}
                        className="cm-proceed-button"
                        onClick={handleProceedToCheckout}
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CartModal;

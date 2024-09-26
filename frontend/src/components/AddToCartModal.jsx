import React, { useState, useEffect } from "react";
import "./css/AddToCartModal.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { useOrderContext } from "../context/OrderContext";
import { useAuth } from "../utils/AuthContext";
import axios from "../utils/axiosConfig"; // Import the pre-configured axios instance

const AddToCartModal = ({ showModal, onClose, item }) => {
    const { currentUser } = useAuth();
    const { addToCart } = useOrderContext();
    const [userQuantity, setUserQuantity] = useState(0);
    const [itemQty, setItemQty] = useState(item ? item.quantity : 0);
    const [totalPrice, setTotalPrice] = useState(item ? item.price : 0);

    useEffect(() => {
        const fetchCartData = async () => {
            if (showModal && currentUser) {
                try {
                    const response = await axios.get(`/carts/cart?uid=${currentUser.id}`);
                    const cart = response.data;
                    console.log('Cart:', cart);

                    // Check if the item is already in the cart
                    const existingItem = cart.items.find(cartItem => cartItem.id === item.itemId);
                    console.log('Existing item:', existingItem.itemQuantity - existingItem.quantity - 1);
                    const existingItemQuantityLeft = existingItem.itemQuantity - existingItem.quantity;

                    // Calculate available quantity for the user
                    setItemQty(existingItemQuantityLeft);
                } catch (error) {
                    console.error('Error fetching cart data:', error);
                    if(error.response.status === 404) {
                        console.log(item.quantity);
                        setItemQty(item.quantity);
                    }
                }
            }
        };

        fetchCartData();
    }, [showModal, currentUser, item]);

    useEffect(() => {
        if (item) {
            setTotalPrice(item.price * userQuantity);
        }
    }, [userQuantity, item]);

    const increaseUserQuantity = () => {
        if (itemQty > 0) {
            setUserQuantity(prevUserQuantity => {
                const newQuantity = prevUserQuantity + 1;
                setItemQty(itemQty - 1);
                return newQuantity;
            });
        }
    };

    const decreaseUserQuantity = () => {
        if (userQuantity > 0) {
            setUserQuantity(prevUserQuantity => {
                const newUserQuantity = prevUserQuantity - 1;
                setItemQty(itemQty + 1);
                return newUserQuantity;
            });
        }
    };

    return (
        <div className={`shop-modal-overlay ${showModal ? 'show' : ''}`} onClick={onClose}>
            <div className="shop-modal" onClick={e => e.stopPropagation()}>
                <button className="shop-close-button" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                {item && (
                    <>
                        <h1>{item.name}</h1>
                        <div className="item-image">
                            <img src={item.imageUrl || '/Assets/Panda.png'} alt={item.name} className="item-image" />
                        </div>
                        <div className="info">
                            <div className="header">
                                <h3>Description:</h3>
                                <h3>Available: {itemQty}</h3>
                            </div>
                            <p>{item.description}</p>
                        </div>
                        <div className="price">
                            <h2>₱{totalPrice.toFixed(2)}</h2>
                        </div>
                        <div className="action-controls">
                            <div className="quantity-controls">
                                <button className="quantity-button" onClick={decreaseUserQuantity}>
                                    <FontAwesomeIcon icon={faMinus} />
                                </button>
                                <span className="quantity-number">{userQuantity}</span>
                                <button className="quantity-button" onClick={increaseUserQuantity} disabled={itemQty === 0}>
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </div>
                            <button className="add-to-cart-button" onClick={async () => {
                                await void addToCart({
                                    item,
                                    userQuantity,
                                    totalPrice,
                                });
                                onClose();
                            }}>Add to Cart</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AddToCartModal;

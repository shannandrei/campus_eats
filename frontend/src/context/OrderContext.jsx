import React, { createContext, useContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig";
import { useAuth } from "../utils/AuthContext";

const OrderContext = createContext();

const fetchCartData = async (currentUser) => {
  try {
    const { data } = await api.get(`/carts/cart?uid=${currentUser.id}`);
    // Directly access response.data with axios

    if(!Array.isArray(data)) {
      return [data];
    }

    if(data.length > 0 ) {
      return data
    }

    return [];
  } catch (error) {
    console.error("Error fetching cart data:", error);
  }
};

export function OrderProvider({ children }) {
  const { currentUser } = useAuth();
  const [cartData, setCartData] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(0);

  const fetchData = async () => {
    const data = await fetchCartData(currentUser);

    if(!data) {
      setCartData([]);
      setCartQuantity(0);

      return
    }

    setCartData(data);
    setCartQuantity(data.length)
  }

  useEffect(() => {
    if (!currentUser) {
      return;
    }        

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const addToCart = async ({ item, userQuantity, totalPrice }) => {
    if (userQuantity > 0) {
      try {
        const response = await api.post("/carts/add-to-cart", {
          item: {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            userQuantity,
          },
          totalPrice,
          uid: currentUser.id,
          shopId: item.shopId,
        });
        console.log("Response:", response);

        if (response.status !== 200) {
          throw new Error(response.data.error || "Failed to add item to cart");
        }

        const data = await fetchCartData(currentUser);

        if(!data) {
          setCartData([]);
          setCartQuantity(0);
        } else {
          setCartData(data);
          setCartQuantity(data.length)
        }
        

      } catch (error) {
        console.error("Error adding item to cart:", error);
        alert(error.message);
      }
    }
  };

  return (
    <OrderContext.Provider
      value={{
        cartData,
        cartQuantity,
        addToCart,
        setCartData,
        fetchData
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  return useContext(OrderContext);
}

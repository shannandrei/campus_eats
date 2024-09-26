import { useOrderContext } from "../../context/OrderContext";

const CartItemCount = ({ showModal, setShowModal }) => {
  const { cartData } = useOrderContext();

  return (
    <div className="nb-cart" onClick={() => setShowModal(!showModal)}>
      <div className="nb-cart-icon">
        <img src={"/Assets/cart.png"} alt="Cart" className="nb-image-cart" />
      </div>
      <div className="nb-cart-count">
        <span>{cartData ? cartData.items.length : 0}</span>
      </div>
    </div>
  );
};

export default CartItemCount;

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import ForgotPassword from './components/ForgotPassword';
import LoginSignUp from './components/LoginSignUp';
import { AuthProvider } from './utils/AuthContext';
import LandingPage from './components/LandingPage';
import Home from './components/Home';
import UserProfile from './components/UserProfile';
import Shop from './components/Shop';
import ShopApplication from './components/ShopApplication';
import DasherApplication from './components/DasherApplication';
import AdminDasherList from './components/AdminDasherList';
import AdminIncomingOrder from './components/AdminIncomingOrder';
import AdminOrderHistory from './components/AdminOrderHistory';
import Order from './components/Order';
// import PrivateRoute from './components/PrivateRoute';
// import AdminRoute from './components/AdminRoute';
// import PublicRoute from './components/PublicRoute';
import AddItem from './components/AddItem';
// import ShopRoute from './components/ShopRoute';
import Checkout from './components/Checkout';
import ShopManage from './components/ShopManage';
import UpdateItem from './components/UpdateItem';
// import UpdateShop from './components/UpdateShop';
import AdminShopList from './components/AdminShopList';
// import DasherRoute from './components/DasherRoute';
import DasherIncomingOrder from './components/DasherIncomingOrder';
import DasherHome from './components/DasherHome';
import ShopUpdate from './components/ShopUpdate';
import DasherUpdate from './components/DasherUpdate';


function App() {
  return (
    
      <Router>
        <AuthProvider>
        <Routes>
          {/* <Route path="/forgot-password" element={<PublicRoute Component={ForgotPassword} />} /> */}
          <Route path="/login" element={<LoginSignUp />} />
          <Route path="/signup" element={<LoginSignUp />} />
          <Route path="/" element={<LandingPage/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin-dashers" element={<AdminDasherList />} />
          <Route path="/admin-incoming-order" element={<AdminIncomingOrder />} />
          <Route path="/admin-order-history" element={<AdminOrderHistory />} />
          <Route path="/admin-shops" element={<AdminShopList />} />
          <Route path="/checkout/:uid/:shopId" element={<Checkout />} />
          <Route path="/shop/:shopId" element={<Shop />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/dasher-application" element={<DasherApplication />} />
          <Route path="/shop-application" element={<ShopApplication />} />
          <Route path="/dasher-orders" element={<DasherHome />} />
          <Route path="/dasher-incoming-order" element={<DasherIncomingOrder />} />
          <Route path="/shop-add-item" element={<AddItem />} />
          <Route path="/shop-manage-item" element={<ShopManage />} />
          <Route path="/dasher-update" element={<DasherUpdate/>} />
          <Route path="/shop-update" element={<ShopUpdate />} />
          <Route path="/edit-item/:itemId" element={<UpdateItem />} />
          
        </Routes>

        {/* <Routes> */}
          {/* 
          
          <Route path="/admin-dashboard" element={<AdminRoute Component={AdminDashboard} />} />
          
          
          <Route path="/admin-shops" element={<AdminRoute Component={AdminShopList} />} /> */}
        {/* </Routes> */}

        {/* <Routes> */}
          {/* 
          
          
          
           */}
        {/* </Routes> */}

        {/* <Routes> */}
          {/* 
          
           */}
        {/* </Routes> */}
        </AuthProvider>
      </Router>
    
  );
}

export default App;

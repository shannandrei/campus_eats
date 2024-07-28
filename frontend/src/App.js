import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
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
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import PublicRoute from './components/PublicRoute';
import AddItem from './components/AddItem';
import ShopRoute from './components/ShopRoute';
import Checkout from './components/Checkout';
import ShopManage from './components/ShopManage';
import UpdateItem from './components/UpdateItem';
// import UpdateShop from './components/UpdateShop';
import AdminShopList from './components/AdminShopList';
import DasherRoute from './components/DasherRoute';
import DasherIncomingOrder from './components/DasherIncomingOrder';
import DasherHome from './components/DasherHome';
import ShopUpdate from './components/ShopUpdate';
import DasherUpdate from './components/DasherUpdate';


function App() {
  return (
    
      <Router>
        <AuthProvider>
        <Routes>
          <Route path="/forgot-password" element={<PublicRoute Component={ForgotPassword} />} />
          <Route path="/reset-password/" element={<PublicRoute Component={ResetPassword} />} />
          <Route path="/login" element={<PublicRoute Component={LoginSignUp} />} />
          <Route path="/signup" element={<PublicRoute Component={LoginSignUp} />} />
          <Route path="/" element={<PublicRoute Component={LandingPage} />} />
          <Route path="/home" element={<PrivateRoute Component={Home}/>} />
          <Route path="/profile" element={<PrivateRoute Component={UserProfile} />} />

          <Route path="/admin-dashers" element={<AdminRoute Component={AdminDasherList} />} />
          <Route path="/admin-incoming-order" element={<AdminRoute Component={AdminIncomingOrder} />} />
          <Route path="/admin-order-history" element={<AdminRoute Component={AdminOrderHistory} />} />
          <Route path="/admin-shops" element={<AdminShopList />} />

          <Route path="/checkout/:uid/:shopId" element={<PrivateRoute Component={Checkout} />} />
          <Route path="/shop/:shopId" element={<PrivateRoute Component={Shop} />} />
          <Route path="/orders" element={<PrivateRoute Component={Order} />} />
          <Route path="/dasher-application" element={<PrivateRoute Component={DasherApplication} />} />
          <Route path="/shop-application" element={<PrivateRoute Component={ShopApplication} />} />
          <Route path="/dasher-orders" element={<DasherRoute Component={DasherHome} />} />
          <Route path="/dasher-incoming-order" element={<DasherRoute Component={DasherIncomingOrder} />} />
          <Route path="/shop-add-item" element={<ShopRoute Component={AddItem} />} />
          <Route path="/shop-manage-item" element={<ShopRoute Component={ShopManage} />} />
          <Route path="/dasher-update" element={<DasherRoute Component={DasherUpdate}/>} />
          <Route path="/shop-update" element={<ShopRoute Component={ShopUpdate} />} />
          <Route path="/edit-item/:itemId" element={<ShopRoute Component={UpdateItem} />} />
          
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

import { useCookies } from 'react-cookie';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/auth/login/Login';
import Registration from './components/auth/registration/Registration';
import Home from './components/common/Home';
import Restaurants from './components/common/Visualization';
import RecipeUpload from './components/restaurant/RecipeUpload';
import Orders from './components/user/Orders';
import FeedbackPolarity from './components/restaurant/FeedbackPolarity';
import SimilarityRecipes from './components/restaurant/SimilarityRecipes';
import ChatUsers from './components/common/ChatUsers';
import Chat from './components/common/Chat';

const RestaurantGuard = ({ children }) => {
  const [cookies] = useCookies(['user']);

  if (cookies.user && cookies.user.isRestaurant) {
    return children;
  }
  return <Navigate to="/" replace />;
};

const CustomerGuard = ({ children }) => {
  const [cookies] = useCookies(['user']);

  if (cookies.user && !cookies.user.isRestaurant) {
    return children;
  }
  return <Navigate to="/" replace />;
};

const Guard = ({ children }) => {
  const [cookies] = useCookies(['user']);

  if (cookies.user.userId) {
    return children;
  }
  return <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Registration />} />
        <Route path="/" element={<Home />}>
          <Route path="/visualization" element={<Restaurants />} />
          <Route path="/chat-users" element={<Guard><ChatUsers /> </Guard>} />
          <Route path="/chat/:orderId" element={<Guard><Chat /> </Guard>} />
          
          <Route path="/recipe-upload" element={<RestaurantGuard><RecipeUpload /></RestaurantGuard>} />
          <Route path="/feedback" element={<RestaurantGuard><FeedbackPolarity /></RestaurantGuard>} />
          <Route path="/recipe-similarity" element={<RestaurantGuard><SimilarityRecipes /></RestaurantGuard>} />

          <Route path="/orders" element={<CustomerGuard><Orders /></CustomerGuard>} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

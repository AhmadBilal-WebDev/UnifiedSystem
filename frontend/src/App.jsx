import { Routes, Route, Navigate } from "react-router-dom";

// Layout Components
import Header from "./Components/Layout/Header";
import Footer from "./Components/Layout/Footer";
import CategoryStickyHeader from "./Components/Layout/CategoryStickyHeader";
import LocationModal from "./Components/Layout/LocationModel";
import PrivateRoute from "./Contants/PrivateRoute";

// Website Pages
import Home from "./Components/Pages/Home";
import Privacy from "./Components/Pages/Privacy";
import Term from "./Components/Pages/Terms";
import Sitemap from "./Components/Pages/Sitemap";
import MyProfile from "./Components/Pages/Profile";
import ForgetPassword from "./Components/Authentication/ResetPassword";
import MyOrders from "./Components/Pages/Order";
import Settings from "./Components/Pages/Setting";
import ConfirmOrder from "./Components/Menu/ConfirmOrder";

import { useCart } from "./Hooks/UseCart";
import { useAuth } from "./Hooks/useAuth";
import { useScroll } from "./Hooks/useScroll";
import { useUserLocation } from "./Hooks/UserLocation";

import DashboardApp from "./dashboard/DashboardApp";

function UserLayout({
  children,
  isStickyVisible,
  isModalOpen,
  handleConfirmLocation,
  orderType,
  setOrderType,
  selectedCity,
  setSelectedCity,
  selectedTown,
  setSelectedTown,
  cartItems,
  user,
  setUser,
}) {
  return (
    <>
      <Header
        cartCount={cartItems.length}
        user={user}
        setUser={setUser}
        selectedTown={selectedTown}
        setSelectedTown={setSelectedTown}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        orderType={orderType}
        setOrderType={setOrderType}
      />
      <CategoryStickyHeader isVisible={isStickyVisible} />
      <LocationModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleConfirmLocation}
        orderType={orderType}
        setOrderType={setOrderType}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedTown={selectedTown}
        setSelectedTown={setSelectedTown}
      />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

function App() {
  const { cartItems, addToCart } = useCart();
  const { user, setUser } = useAuth();
  const isStickyVisible = useScroll(500);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + Number(item.totalPrice || 0),
    0,
  );
  const {
    isModalOpen,
    orderType,
    setOrderType,
    selectedCity,
    setSelectedCity,
    selectedTown,
    setSelectedTown,
    handleConfirmLocation,
  } = useUserLocation();

  const layoutProps = {
    isStickyVisible,
    isModalOpen,
    handleConfirmLocation,
    orderType,
    setOrderType,
    selectedCity,
    setSelectedCity,
    selectedTown,
    setSelectedTown,
    cartItems,
    user,
    setUser,
  };

  return (
    <Routes>
      {/* ── Customer Website ─────────────────────────────────── */}
      <Route
        path="/"
        element={
          <UserLayout {...layoutProps}>
            <Home addToCart={addToCart} />
          </UserLayout>
        }
      />
      <Route path="/update-email" element={<ForgetPassword />} />
      <Route
        path="/privacy"
        element={
          <UserLayout {...layoutProps}>
            <Privacy />
          </UserLayout>
        }
      />
      <Route
        path="/terms"
        element={
          <UserLayout {...layoutProps}>
            <Term />
          </UserLayout>
        }
      />
      <Route
        path="/sitemap"
        element={
          <UserLayout {...layoutProps}>
            <Sitemap />
          </UserLayout>
        }
      />
      <Route
        path="/confirm-order"
        element={
          <UserLayout {...layoutProps}>
            <ConfirmOrder
              cartItems={cartItems}
              cartStats={{ total: cartTotal, count: cartItems.length }}
            />
          </UserLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <UserLayout {...layoutProps}>
            <PrivateRoute>
              <MyProfile />
            </PrivateRoute>
          </UserLayout>
        }
      />
      <Route
        path="/my-orders"
        element={
          <UserLayout {...layoutProps}>
            <PrivateRoute>
              <MyOrders />
            </PrivateRoute>
          </UserLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <UserLayout {...layoutProps}>
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          </UserLayout>
        }
      />

      {/* ── Admin Dashboard at /admin (handles its own login + all sub-pages) ── */}
      <Route path="/admin/*" element={<DashboardApp />} />

      {/* Wildcard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

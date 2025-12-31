import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import TrangMenu from "./pages/TrangMenu";
import CartPage from "./pages/CartPage";
import FeedbackPage from "./pages/FeedbackPage";
import ProfilePage from "./pages/ProfilePage";
import MenuManagementPage from "./pages/MenuManagement";
import InventoryPage from "./pages/Inventory";
import UserAccountPage from "./pages/UserAccount";
import FeedbackAdminPage from "./pages/FeedbackAdminPage";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import OrdersPage from "./pages/DailyOrder";

import LandingPage from "./pages/landingPage";
import LoginForm from "./LoginForm";

import { CartProvider } from "./context/CartContext";

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [user, setUser] = useState(null);

  // load user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentPage("home");
    }
  }, []);

  /* =====================
     CHƯA LOGIN
  ===================== */
  if (!user) {
    if (currentPage === "login") {
      return <LoginForm setUser={setUser} setCurrentPage={setCurrentPage} />;
    }

    return <LandingPage setCurrentPage={setCurrentPage} />;
  }

  /*const user = {
    name: "Nguyễn Văn A",
    avatar: "/images/user-avatar.jpg",
    role: "customer",
  };*/
  const renderPage = () => {
    // ADMIN
    if (user.role === "admin") {
      switch (currentPage) {
        case "menumanagement":
          return <MenuManagementPage />;
        case "inventory":
          return <InventoryPage />;
        case "users":
          return <UserAccountPage />;
        case "adminfeedback":
          return <FeedbackAdminPage />;
        case "ordersmanagement":
          return <OrdersPage />;
        default:
          return <MenuManagementPage />;
      }
    }

    // customer / USER
    switch (currentPage) {
      case "home":
        return (
          <Home setCurrentPage={setCurrentPage} searchKeyword={searchKeyword} />
        );
      case "menu":
        return (
          <TrangMenu
            setCurrentPage={setCurrentPage}
            searchKeyword={searchKeyword}
          />
        );
      case "cart":
        return <CartPage setCurrentPage={setCurrentPage} />;
      case "feedback":
        return <FeedbackPage setCurrentPage={setCurrentPage} />;
      case "profile":
        return <ProfilePage setCurrentPage={setCurrentPage} />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <CartProvider>
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar role={user.role} setCurrentPage={setCurrentPage} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header
            user={user}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
          />

          <div style={{ padding: "20px", overflowY: "auto" }}>
            {renderPage()}
          </div>
        </div>
      </div>
    </CartProvider>
  );
}

import React, { useState } from "react";
import Home from "./pages/Home";
import TrangMenu from "./pages/TrangMenu";
import CartPage from "./pages/CartPage";
import FeedbackPage from "./pages/FeedbackPage";
import ProfilePage from "./pages/ProfilePage";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import { CartProvider } from "./context/CartContext";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home setCurrentPage={setCurrentPage} />;
      case "menu":
        return <TrangMenu setCurrentPage={setCurrentPage} />;
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
        <Sidebar setCurrentPage={setCurrentPage} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header setCurrentPage={setCurrentPage} />

          <div style={{ padding: "20px", overflowY: "auto" }}>
            {renderPage()}
          </div>
        </div>
      </div>
    </CartProvider>
  );
}

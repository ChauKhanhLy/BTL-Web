// App.jsx
import React, { useState } from "react";
import Home from "./pages/Home";
import TrangMenu from "./pages/TrangMenu";
import CartPage from "./pages/CartPage";
import FeedbackPage from "./pages/FeedbackPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <>
      {currentPage === "home" && <Home setCurrentPage={setCurrentPage} />}
      {currentPage === "menu" && <TrangMenu setCurrentPage={setCurrentPage} />}
      {currentPage === "cart" && <CartPage setCurrentPage={setCurrentPage} />}
      {currentPage === "feedback" && <FeedbackPage setCurrentPage={setCurrentPage} />}
      {currentPage === "profile" && <ProfilePage setCurrentPage={setCurrentPage} />}
    </>
  );
}

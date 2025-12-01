import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TodayNotice from "../components/TodayNotice";
import MealSummary from "../components/MealSummary";
import SuggestedMenu from "../components/SuggestedMenu";
import RecentCost from "../components/RecentCost";
import Cart from "../components/Cart";
import Feedback from "../components/Feedback";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-4">
        <Header />

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="col-span-2 space-y-4">
            <TodayNotice />
            <MealSummary />
            <SuggestedMenu />
          </div>

          <div className="col-span-1 space-y-4">
            <RecentCost />
            <Cart />
          </div>
        </div>

        <Feedback />
      </div>
    </div>
  );
}

import React from "react";
import TodayNotice from "../components/TodayNotice";
import MealSummary from "../components/MealSummary";
import SuggestedMenu from "../components/SuggestedMenu";
import RecentCost from "../components/RecentCost";
import Cart from "../components/Cart";
import Feedback from "../components/Feedback";

export default function Home({ setCurrentPage }) {
  return (
      <div className="flex-1 p-4">
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
  );
}

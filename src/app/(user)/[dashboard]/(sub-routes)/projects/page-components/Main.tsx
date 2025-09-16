import React from "react";
import Header from "./Header";
import Stats from "./Stats";
import AllProjectsDisplay from "./AllProjectsDisplay";

const Main = () => {
  return <div className="flex flex-col gap-y-4 w-full px-2 md:px-4  h-auto">
    <Header/>
    <Stats/>
    <AllProjectsDisplay/>
  </div>;
};

export default Main;

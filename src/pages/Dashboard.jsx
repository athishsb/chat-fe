import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const basePath = location.pathname;
  console.log("Base path: " + basePath);

  return <div>Dashboard</div>;
};

export default Dashboard;

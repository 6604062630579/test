// ... import เหมือนเดิม
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { io } from "socket.io-client";

export const DashboardContext = createContext(null);

const DashboardContextProvider = (props) => {
  const [dateRange, setDateRange] = useState(
    localStorage.getItem("dateRange") || "monthly"
  );
  const [amountMenu, setAmountMenu] = useState(0);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [foodList, setFoodList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);

  const socket = useState(() =>
    io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    })
  )[0];

  const fecthAnalytics = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/analytics/get`,
        {
          params: { dateRange },
        }
      );

      if (response.data.success) {
        setAnalyticsData(response.data.sales);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating order status");
    }
  };

  const fetchFood = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/product/list`
      );
      if (response.data.success) {
        setAmountMenu(response.data.product.length);
        const sortedFood = response.data.product.sort((a, b) =>
          a.category.localeCompare(b.category)
        );
        setFoodList(sortedFood);
      }
    } catch (error) {
      toast.error("Failed to fetch food list");
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/listStaff`
      );
      if (response.data.success) {
        setEmployeeList(response.data.staff);
      }
    } catch (error) {
      toast.error("Failed to fetch employee list");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/list`
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setOrders(response.data.order);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const fetchTable = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/table/list`
      );
      if (response.data.success) {
        setTables(response.data.tables);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    socket.on("orderUpdated", fetchOrders);
    socket.on("tableUpdated", fetchTable);

    return () => {
      socket.off("orderUpdated", fetchOrders);
      socket.off("tableUpdated", fetchTable);
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    fetchFood();
    fetchOrders();
    fetchTable();
    fetchEmployee();
    fecthAnalytics();
  }, [dateRange]);

  const totalOrders = (analyticsData || []).reduce(
    (sum, entry) => sum + entry.orderAmount,
    0
  );

  const totalCustomers = (analyticsData || []).reduce(
    (sum, entry) => sum + entry.customerAmount,
    0
  );
  const totalIncome = (analyticsData || []).reduce(
    (sum, entry) => sum + entry.totalIncome,
    0
  );

  const foodSales = {};

  (analyticsData || []).forEach((entry) => {
    // ตรวจสอบให้แน่ใจว่า entry เป็น object และ OrderFood เป็น array
    const orderFood = Array.isArray(entry?.OrderFood) ? entry.OrderFood : [];
    orderFood.forEach((food) => {
      if (!foodSales[food.name]) {
        foodSales[food.name] = {
          quantitySold: food.quantitySold,
          image: Array.isArray(food.image) ? food.image[0] : null,
        };
      } else {
        foodSales[food.name].quantitySold += food.quantitySold;
      }
    });
  });

  const popularFood = Object.entries(foodSales)
    .sort((a, b) => b[1].quantitySold - a[1].quantitySold)
    .slice(0, 5)
    .map(([name, { quantitySold, image }]) => ({ name, quantitySold, image }));

  const contextValue = {
    amountMenu,
    setAmountMenu,
    analyticsData,
    setAnalyticsData,
    foodList,
    fetchFood,
    totalOrders,
    totalCustomers,
    totalIncome,
    popularFood,
    fetchEmployee,
    employeeList,
    orders,
    fetchOrders,
    fecthAnalytics,
    dateRange,
    setDateRange,
    tables,
    setTables,
    fetchTable,
  };

  useEffect(() => {
    if (dateRange) {
      localStorage.setItem("dateRange", dateRange);
    }
  }, [dateRange]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {props.children}
    </DashboardContext.Provider>
  );
};

export default DashboardContextProvider;

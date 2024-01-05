import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const Orders = () => {
  const [cookies] = useCookies(["user"]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      // const response = await axios.get(ORDER_FUNCTION_URL, { params: { userId: cookies.user.userId } });
      // const list = response.data;

      const list = [
        { id: 1, name: "Order 1" },
        { id: 2, name: "Order 2" },
        { id: 3, name: "Order 3" },
      ];
      setOrders(list);
    };

    fetchOrders();
  }, []);

  return (
    <center>
      <h1>Orders</h1>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>{order.name}</li>
        ))}
      </ul>
    </center>
  );
};

export default Orders;
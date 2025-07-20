import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrderData = async () => {
    try {
      if (!token) {
        setLoading(false);
        return null;
      }
      
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/order/userorders`, 
        {}, 
        { headers: { token } }
      );

      if (response.data.success) {
        const allOrdersItem = response.data.orders.flatMap(order => 
          order.items.map(item => ({
            ...item,
            status: order.status,
            payment: order.payment ? 'Paid' : 'Pending',
            paymentMethod: order.paymentMethod,
            date: order.date
          }))
        );
        setOrderData(allOrdersItem.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className='pt-16 border-t'>
      <div className='text-2xl px-4 sm:px-6'>
        <Title text1={'YOUR'} text2={'ORDERS'} />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : orderData.length > 0 ? (
        <div className="px-4 sm:px-6">
          {orderData.map((item, index) => (
            <div 
              key={`${item._id}-${index}`} 
              className='flex flex-col gap-4 py-6 text-gray-700 border-b last:border-b-0'
            >
              <div className='flex items-start gap-6 text-sm'>
                <img 
                  className='w-16 sm:w-20 rounded-md object-cover' 
                  src={item.image[0]} 
                  alt={item.name} 
                />
                <div className="flex-1">
                  <p className='font-medium sm:text-base'>{item.name}</p>
                  <div className='flex flex-wrap items-center gap-3 mt-1 text-base text-gray-700'>
                    <p>{currency}{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className='mt-1'>
                    Date: <span className='text-gray-400'>{new Date(item.date).toLocaleDateString()}</span>
                  </p>
                  <p className='mt-1'>
                    Payment: <span className='text-gray-400'>{item.payment}</span>
                  </p>
                  <p className='mt-1'>
                    Method: <span className='text-gray-400'>{item.paymentMethod}</span>
                  </p>
                </div>
              </div>
              
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-2'>
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(item.status)}`}></div>
                  <p className='text-sm md:text-base capitalize'>{item.status.toLowerCase()}</p>
                </div>
                <button 
                  onClick={loadOrderData} 
                  className='px-4 py-2 text-sm font-medium border rounded-sm hover:bg-gray-100 transition-colors'
                >
                  REFRESH STATUS
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 sm:px-6 py-12 text-center">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      )}
    </div>
  );
};

export default Orders;
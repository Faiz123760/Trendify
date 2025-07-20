import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);

  const [method, setMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData(data => ({
      ...data,
      [name]: value,
    }));
  };


  const initPay = (order) =>{
        const options = {
          key : import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount : order.amount, // Amount in paise
          currency : order.currency,
          name : 'Order payment',
          description : 'Order payment for your purchase',
          order_id : order.id, // This is the Razorpay order ID
          handler:async (response)=>{
            console.log(response);
            try{
              const {data} = await axios.post(backendUrl + '/api/order/verifyRazorpay',response,{headers:{token}});
              if(data.success){
                navigate('/orders')
                setCartItems({})
              }
            }catch(error){
              console.log(error)
              toast.error(error.message)
            }
          }
        }
        const rzp = new window.Razorpay(options);
        rzp.open();
  }

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill all required fields`);
      return false;
    }

    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    if (Object.keys(cartItems).length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      let orderItems = [];
      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          if (cartItems[productId][size] > 0) {
            const productInfo = products.find(product => product._id === productId);
            if (productInfo) {
              orderItems.push({
                ...structuredClone(productInfo),
                size,
                quantity: cartItems[productId][size]
              });
            }
          }
        }
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        paymentMethod: method
      };

      switch (method) {
        case 'cod': {
          const response = await axios.post(
            `${backendUrl}/api/order/place`,
            orderData,
            { headers: { token } }
          );

          if (response.data.success) {
            toast.success('Order placed successfully!');
            setCartItems({});
            navigate('/orders', { replace: true });
          } else {
            toast.error(response.data.message || 'Failed to place order');
          }
          break;
        }
        case 'stripe':
          {
            const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers: { token } });
            if (responseStripe.data.success) {
              const {session_url} = responseStripe.data;
              window.location.replace(session_url);
            }else{
              toast.error(responseStripe.data.message || 'Failed to initiate Stripe payment');
            }
            break;
          }
        case 'razorpay': {
          const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay',orderData, { headers: { token } })
          if(responseRazorpay.data.success){
               initPay(responseRazorpay.data.order)
          }
          break;
        }
        default: {
          toast.error('Please select a valid payment method');
          break;
        }
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 
                 error.message || 
                 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col justify-between gap-4 pt-5 sm:flex-row sm:pt-14 min-h-[80vh] border-t'>
      {/* Left Side - Delivery Information */}
      <div className='flex flex-col w-full gap-4 sm:max-w-[480px]'>
        <div className='my-3 text-xl sm:text-2xl'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        
        <div className='flex gap-3'>
          <input
            onChange={onChangeHandler}
            name='firstName'
            value={formData.firstName}
            required
            className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black'
            type="text"
            placeholder='First Name'
          />
          <input
            onChange={onChangeHandler}
            name='lastName'
            value={formData.lastName}
            required
            className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black'
            type="text"
            placeholder='Last Name'
          />
        </div>

        <input
          onChange={onChangeHandler}
          name='email'
          value={formData.email}
          required
          className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black'
          type="email"
          placeholder='Email Address'
        />

        <input
          onChange={onChangeHandler}
          name='street'
          value={formData.street}
          required
          className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black'
          type="text"
          placeholder='Street Address'
        />

        <div className='flex gap-3'>
          <input
            onChange={onChangeHandler}
            name='city'
            value={formData.city}
            required
            className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black'
            type="text"
            placeholder='City'
          />
          <input
            onChange={onChangeHandler}
            name='state'
            value={formData.state}
            required
            className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black'
            type="text"
            placeholder='State/Province'
          />
        </div>

        <div className='flex gap-3'>
          <input
            onChange={onChangeHandler}
            name='zipcode'
            value={formData.zipcode}
            required
            className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black'
            type="text"
            placeholder='Postal/Zip Code'
          />
          <input
            onChange={onChangeHandler}
            name='country'
            value={formData.country}
            required
            className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black'
            type="text"
            placeholder='Country'
          />
        </div>

        <input
          onChange={onChangeHandler}
          name='phone'
          value={formData.phone}
          required
          className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black'
          type="tel"
          placeholder='Phone Number'
        />
      </div>

      {/* Right Side - Order Summary and Payment */}
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal />
        </div>

        {/* Payment Methods */}
        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHODS'} />
          
          <div className='flex flex-col gap-3 lg:flex-row'>
            <div
              onClick={() => setMethod('stripe')}
              className={`flex items-center gap-3 p-2 px-3 border rounded cursor-pointer ${method === 'stripe' ? 'border-black' : ''}`}
            >
              <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-600 border-green-600' : 'border-gray-400'}`}></div>
              <img className='h-5 mx-4' src={assets.stripe_logo} alt="Stripe" />
            </div>
            
            <div
              onClick={() => setMethod('razorpay')}
              className={`flex items-center gap-3 p-2 px-3 border rounded cursor-pointer ${method === 'razorpay' ? 'border-black' : ''}`}
            >
              <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-600 border-green-600' : 'border-gray-400'}`}></div>
              <img className='h-5 mx-4' src={assets.razorpay_logo} alt="RazorPay" />
            </div>
            
            <div
              onClick={() => setMethod('cod')}
              className={`flex items-center gap-3 p-2 px-3 border rounded cursor-pointer ${method === 'cod' ? 'border-black' : ''}`}
            >
              <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-600 border-green-600' : 'border-gray-400'}`}></div>
              <p className='mx-4 text-sm font-medium text-gray-500'>CASH ON DELIVERY</p>
            </div>
          </div>

          <div className='w-full mt-8 text-end'>
            <button
              type='submit'
              disabled={isSubmitting}
              className={`px-16 py-3 text-sm text-white bg-black hover:bg-gray-800 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'PROCESSING...' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
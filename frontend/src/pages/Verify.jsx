import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const VerifyPayment = () => {
  const { token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Get parameters from URL
  const success = searchParams.get('success') === 'true'; // Convert to boolean
  const orderId = searchParams.get('orderId');
  const paymentMethod = searchParams.get('method') || 'stripe'; // Default to stripe

  const verifyPayment = async () => {
    if (!token || !orderId) {
      toast.error('Missing required information');
      navigate('/cart');
      return;
    }

    try {
      setIsVerifying(true);
      
      const endpoint = paymentMethod === 'razorpay' 
        ? '/api/order/verifyRazorpay' 
        : '/api/order/verifyStripe';

      const response = await axios.post(
        `${backendUrl}${endpoint}`,
        { success, orderId },
        { headers: { token } }
      );

      if (response.data.success) {
        setCartItems({});
        toast.success('Payment verified successfully!');
        navigate('/orders', { replace: true });
      } else {
        toast.warning(response.data.message || 'Payment verification failed');
        navigate('/cart', { replace: true });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to verify payment. Please check your order history.'
      );
      navigate('/orders', { replace: true });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    // Only verify if we have all required parameters
    if (orderId) {
      verifyPayment();
    } else {
      toast.error('Invalid verification link');
      navigate('/');
    }
  }, [token, orderId]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 text-center bg-white rounded-lg shadow-md">
        {isVerifying ? (
          <>
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800">Verification Complete</h2>
            <p className="text-gray-600">You will be redirected shortly...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyPayment;
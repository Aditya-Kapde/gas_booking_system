import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import './PaymentPage.css';

const BACKEND_URL = 'http://localhost:5000'; // Add backend URL
const MERCHANT_UPI = "ankitkumarji296@okaxis";

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingDetails, addressData } = location.state || {};
    const [paymentMethod, setPaymentMethod] = useState('');
    const [upiId, setUpiId] = useState('');
    const [showUpiInput, setShowUpiInput] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentVerificationInterval, setPaymentVerificationInterval] = useState(null);
    const [verificationAttempts, setVerificationAttempts] = useState(0);
    const MAX_VERIFICATION_ATTEMPTS = 20; // 2 minutes (6 seconds * 20 attempts)

    // Cleanup interval on component unmount
    useEffect(() => {
        return () => {
            if (paymentVerificationInterval) {
                clearInterval(paymentVerificationInterval);
            }
        };
    }, [paymentVerificationInterval]);

    if (!bookingDetails || !addressData) {
        return (
            <div className="payment-container">
                <div className="payment-error">
                    <h2>Error: No booking details found</h2>
                    <button onClick={() => navigate('/booking')}>Return to Booking</button>
                </div>
            </div>
        );
    }

    const handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method);
        setShowUpiInput(method === 'UPI');
    };

    const generateUPIUrl = (amount, orderId, customerUpiId) => {
        // Basic validation
        if (!customerUpiId || !amount || !orderId) {
            throw new Error('Missing required UPI parameters');
        }

        // Format amount to have exactly 2 decimal places
        const formattedAmount = Number(amount).toFixed(2);

        // Construct UPI payment URL specifically for Google Pay
        const upiParams = {
            pa: MERCHANT_UPI, // Payee address (merchant VPA)
            pn: "Gas Booking System", // Payee name
            tr: orderId, // Transaction reference
            tn: `Gas Booking - ${orderId}`, // Transaction note
            am: formattedAmount, // Amount
            cu: "INR", // Currency
            mode: "00", // Mode of payment (collect)
            purpose: "00" // Purpose code for merchant payment
        };

        // Create the UPI URL with encoded parameters
        const upiUrl = Object.entries(upiParams)
            .filter(([_, value]) => value !== "") // Remove empty parameters
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        return {
            deepLink: `upi://collect?${upiUrl}`,
            gpayWeb: `https://pay.google.com/payments/u/0/home#v2g?pa=${MERCHANT_UPI}&pn=Gas%20Booking%20System&tr=${orderId}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`Gas Booking - ${orderId}`)}`,
            intentUrl: `intent://upi/pay?${upiUrl}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`
        };
    };

    const verifyPayment = async (orderId) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/verify-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.status === 'completed';
        } catch (error) {
            console.error('Payment verification error:', error);
            return false;
        }
    };

    const startPaymentVerification = (orderId) => {
        if (paymentVerificationInterval) {
            clearInterval(paymentVerificationInterval);
        }

        setVerificationAttempts(0);
        
        const intervalId = setInterval(async () => {
            setVerificationAttempts(prev => {
                const newAttempts = prev + 1;
                if (newAttempts >= MAX_VERIFICATION_ATTEMPTS) {
                    clearInterval(intervalId);
                    setIsProcessing(false);
                    setPaymentStatus('failed');
                    alert('Payment verification timeout. Please check your UPI app and confirm the payment.');
                }
                return newAttempts;
            });

            try {
                const isVerified = await verifyPayment(orderId);
                if (isVerified) {
                    clearInterval(intervalId);
                    setIsProcessing(false);
                    setPaymentStatus('success');
                    alert('Payment successful! Your order has been placed.');
                    navigate('/orders');
                }
            } catch (error) {
                console.error('Error during payment verification:', error);
            }
        }, 6000);

        setPaymentVerificationInterval(intervalId);
    };

    const createOrder = async (paymentDetails) => {
        try {
            const orderId = 'ORD' + Date.now();
            const response = await fetch(`${BACKEND_URL}/api/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    amount: bookingDetails.totalPrice,
                    bookingDetails,
                    addressData,
                    ...paymentDetails
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to create order');
            }

            return { success: true, orderId };
        } catch (error) {
            console.error('Error creating order:', error);
            return { success: false, error: error.message };
        }
    };

    const processUPIPayment = async () => {
        if (!upiId) {
            alert('Please enter your UPI ID');
            return;
        }

        // Validate UPI ID format
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
        if (!upiRegex.test(upiId)) {
            alert('Please enter a valid UPI ID (e.g., username@upi)');
            return;
        }

        setIsProcessing(true);

        // Create order with UPI payment details
        const orderResult = await createOrder({
            paymentMethod: 'UPI',
            customerUpiId: upiId,
            merchantUpiId: MERCHANT_UPI,
            status: 'pending'
        });

        if (!orderResult.success) {
            setIsProcessing(false);
            alert(`Failed to create order: ${orderResult.error}`);
            return;
        }

        const orderId = orderResult.orderId;

        try {
            // Generate UPI URLs
            const upiUrls = generateUPIUrl(bookingDetails.totalPrice, orderId, upiId);
            console.log('Generated UPI URLs:', upiUrls);

            // Create a modal or div to show payment instructions
            const paymentInstructions = document.createElement('div');
            paymentInstructions.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                z-index: 1000;
                max-width: 80%;
                text-align: center;
            `;

            paymentInstructions.innerHTML = `
                <h3>Payment Instructions</h3>
                <p>Amount: ₹${bookingDetails.totalPrice}</p>
                <p>To: ${MERCHANT_UPI}</p>
                <p>Order ID: ${orderId}</p>
                <p style="margin-top: 15px;">Please follow these steps:</p>
                <ol style="text-align: left;">
                    <li>Open Google Pay on your Android device</li>
                    <li>Click on "Pay" or the scan icon</li>
                    <li>Enter this UPI ID: ${MERCHANT_UPI}</li>
                    <li>Enter amount: ₹${bookingDetails.totalPrice}</li>
                    <li>In remarks/note enter: Order ${orderId}</li>
                    <li>Complete the payment</li>
                </ol>
                <button onclick="window.location.href='${upiUrls.gpayWeb}'">
                    Open Google Pay Web
                </button>
                <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
                    After completing the payment, you can close this window.<br>
                    We will automatically verify your payment.
                </p>
                <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: #666; color: white; border: none; border-radius: 5px;">
                    Close Instructions
                </button>
            `;

            document.body.appendChild(paymentInstructions);

            // Start payment verification
            startPaymentVerification(orderId);

        } catch (error) {
            console.error('Error processing payment:', error);
            setIsProcessing(false);
            setPaymentStatus('failed');
            alert(`Failed to initiate payment: ${error.message}`);
        }
    };

    const processCODPayment = async () => {
        setIsProcessing(true);

        // Create order with COD payment details
        const orderResult = await createOrder({
            paymentMethod: 'COD',
            status: 'confirmed',
            paymentConfirmed: false // Will be confirmed on delivery
        });

        setIsProcessing(false);

        if (orderResult.success) {
            alert('Order placed successfully! You can pay cash on delivery.');
            navigate('/orders');
        } else {
            alert(`Failed to place order: ${orderResult.error}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        if (paymentMethod === 'UPI') {
            await processUPIPayment();
        } else if (paymentMethod === 'COD') {
            await processCODPayment();
        }
    };

    if (isProcessing) {
        return <LoadingSpinner message={paymentMethod === 'UPI' ? 'Processing Payment...' : 'Confirming Order...'} />;
    }

    return (
        <div className="payment-container">
            <div className="payment-box">
                <h2>Order Summary</h2>
                
                <div className="order-details">
                    <div className="section">
                        <h3>Booking Details</h3>
                        <p>Brand: {bookingDetails.brand}</p>
                        <p>Weight: {bookingDetails.weight}</p>
                        <p>Quantity: {bookingDetails.quantity}</p>
                        <p>Total Price: ₹{bookingDetails.totalPrice}</p>
                    </div>

                    <div className="section">
                        <h3>Delivery Details</h3>
                        <p>{addressData.fullName}</p>
                        <p>{addressData.streetAddress}</p>
                        {addressData.apartment && <p>{addressData.apartment}</p>}
                        {addressData.landmark && <p>Landmark: {addressData.landmark}</p>}
                        <p>{addressData.city}, {addressData.state} - {addressData.pincode}</p>
                        <p>Phone: {addressData.phoneNumber}</p>
                        <p>Delivery Date: {new Date(addressData.deliveryDate).toLocaleDateString()}</p>
                        <p>Time Slot: {addressData.timeSlot}</p>
                    </div>

                    <div className="section">
                        <h3>Select Payment Method</h3>
                        <div className="payment-methods">
                            <div 
                                className={`payment-option ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                                onClick={() => handlePaymentMethodSelect('UPI')}
                            >
                                <img src="/images/upi-icon.svg" alt="UPI" />
                                <span>UPI Payment</span>
                            </div>
                            <div 
                                className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                                onClick={() => handlePaymentMethodSelect('COD')}
                            >
                                <img src="/images/cod-icon.svg" alt="Cash on Delivery" />
                                <span>Cash on Delivery</span>
                            </div>
                        </div>

                        {showUpiInput && (
                            <div className="upi-input-container">
                                <input
                                    type="text"
                                    placeholder="Enter your UPI ID"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    required={paymentMethod === 'UPI'}
                                />
                                <p className="merchant-upi">Payment will be requested from: {MERCHANT_UPI}</p>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    className="confirm-button"
                    onClick={handleSubmit}
                    disabled={!paymentMethod || (paymentMethod === 'UPI' && !upiId)}
                >
                    {paymentMethod === 'UPI' ? 'Pay Now' : 'Confirm Order'}
                </button>
            </div>
        </div>
    );
};

export default PaymentPage; 
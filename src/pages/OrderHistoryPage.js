import React, { useState, useEffect } from 'react';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reviewText, setReviewText] = useState('');
    const [complaintText, setComplaintText] = useState('');
    const [rating, setRating] = useState(5);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/orders');
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (orderId) => {
        try {
            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    rating,
                    review: reviewText
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            alert('Review submitted successfully!');
            setSelectedOrder(null);
            setReviewText('');
            setRating(5);
            fetchOrders(); // Refresh orders list
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        }
    };

    const handleComplaintSubmit = async (orderId) => {
        try {
            const response = await fetch('http://localhost:5000/api/complaints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    complaint: complaintText
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit complaint');
            }

            alert('Complaint submitted successfully!');
            setSelectedOrder(null);
            setComplaintText('');
            fetchOrders(); // Refresh orders list
        } catch (error) {
            console.error('Error submitting complaint:', error);
            alert('Failed to submit complaint. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="loading">Loading orders...</div>;
    }

    return (
        <div className="order-history-container">
            <h1>Order History</h1>
            {orders.length === 0 ? (
                <div className="no-orders">No orders found</div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <h3>Order #{order.orderId}</h3>
                                <span className={`status ${order.status.toLowerCase()}`}>
                                    {order.status}
                                </span>
                            </div>
                            
                            <div className="order-details">
                                <div className="detail-section">
                                    <h4>Booking Details</h4>
                                    <p>Brand: {order.bookingDetails.brand}</p>
                                    <p>Weight: {order.bookingDetails.weight}</p>
                                    <p>Quantity: {order.bookingDetails.quantity}</p>
                                    <p>Total Price: ₹{order.bookingDetails.totalPrice}</p>
                                </div>

                                <div className="detail-section">
                                    <h4>Delivery Details</h4>
                                    <p>{order.addressData.fullName}</p>
                                    <p>{order.addressData.streetAddress}</p>
                                    <p>{order.addressData.city}, {order.addressData.state}</p>
                                    <p>PIN: {order.addressData.pincode}</p>
                                </div>

                                <div className="detail-section">
                                    <h4>Payment Details</h4>
                                    <p>Method: {order.paymentMethod}</p>
                                    <p>Date: {formatDate(order.createdAt)}</p>
                                </div>
                            </div>

                            {order.review && (
                                <div className="review-section">
                                    <h4>Your Review</h4>
                                    <div className="stars">{'★'.repeat(order.review.rating)}{'☆'.repeat(5-order.review.rating)}</div>
                                    <p>{order.review.review}</p>
                                </div>
                            )}

                            {order.complaint && (
                                <div className="complaint-section">
                                    <h4>Your Complaint</h4>
                                    <p>{order.complaint.text}</p>
                                    <p className="complaint-status">Status: {order.complaint.status}</p>
                                </div>
                            )}

                            <div className="order-actions">
                                {!order.review && (
                                    <button 
                                        className="action-button review"
                                        onClick={() => setSelectedOrder({ type: 'review', id: order.orderId })}
                                    >
                                        Write Review
                                    </button>
                                )}
                                {!order.complaint && (
                                    <button 
                                        className="action-button complaint"
                                        onClick={() => setSelectedOrder({ type: 'complaint', id: order.orderId })}
                                    >
                                        File Complaint
                                    </button>
                                )}
                            </div>

                            {selectedOrder?.type === 'review' && selectedOrder?.id === order.orderId && (
                                <div className="modal">
                                    <div className="modal-content">
                                        <h3>Write a Review</h3>
                                        <div className="rating-input">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {star <= rating ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </div>
                                        <textarea
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="Write your review here..."
                                        />
                                        <div className="modal-actions">
                                            <button onClick={() => handleReviewSubmit(order.orderId)}>Submit</button>
                                            <button onClick={() => setSelectedOrder(null)}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedOrder?.type === 'complaint' && selectedOrder?.id === order.orderId && (
                                <div className="modal">
                                    <div className="modal-content">
                                        <h3>File a Complaint</h3>
                                        <textarea
                                            value={complaintText}
                                            onChange={(e) => setComplaintText(e.target.value)}
                                            placeholder="Describe your issue here..."
                                        />
                                        <div className="modal-actions">
                                            <button onClick={() => handleComplaintSubmit(order.orderId)}>Submit</button>
                                            <button onClick={() => setSelectedOrder(null)}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage; 
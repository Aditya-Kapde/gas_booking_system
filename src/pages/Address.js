import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Address.css';

const timeSlots = [
    "9:00 AM - 11:00 AM",
    "11:00 AM - 1:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM"
];

const Address = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingDetails = location.state?.bookingDetails;

    // Get tomorrow's date as the minimum date for delivery
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    // Get date 30 days from now as the maximum date
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    const [addressData, setAddressData] = useState({
        fullName: '',
        phoneNumber: '',
        streetAddress: '',
        apartment: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        deliveryDate: minDate,
        timeSlot: timeSlots[0]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddressData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!bookingDetails) {
            alert('No booking details found. Please start from the booking page.');
            navigate('/booking');
            return;
        }
        // Navigate to payment page with both booking and address details
        navigate('/payment', { 
            state: { 
                bookingDetails,
                addressData 
            } 
        });
    };

    // If no booking details are present, redirect to booking page
    if (!bookingDetails) {
        return (
            <div className="address-container">
                <h2>Error: No booking details found</h2>
                <button className="submit-btn" onClick={() => navigate('/booking')}>
                    Return to Booking
                </button>
            </div>
        );
    }

    return (
        <div className="address-container">
            <h2>Delivery Address</h2>
            
            <div className="booking-summary">
                <h3>Booking Summary</h3>
                <p>Brand: {bookingDetails.brand}</p>
                <p>Weight: {bookingDetails.weight}</p>
                <p>Quantity: {bookingDetails.quantity}</p>
                <p>Total Price: ₹{bookingDetails.totalPrice}</p>
            </div>

            <form className="address-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        name="fullName"
                        value={addressData.fullName}
                        onChange={handleChange}
                        placeholder="Full Name *"
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={addressData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Phone Number *"
                        pattern="[0-9]{10}"
                        required
                    />
                </div>

                <div className="form-group">
                    <textarea
                        name="streetAddress"
                        value={addressData.streetAddress}
                        onChange={handleChange}
                        placeholder="Street Address *"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <input
                            type="text"
                            name="apartment"
                            value={addressData.apartment}
                            onChange={handleChange}
                            placeholder="Apartment/Floor (Optional)"
                        />
                    </div>
                    <div className="form-group half">
                        <input
                            type="text"
                            name="landmark"
                            value={addressData.landmark}
                            onChange={handleChange}
                            placeholder="Landmark (Optional)"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group third">
                        <input
                            type="text"
                            name="city"
                            value={addressData.city}
                            onChange={handleChange}
                            placeholder="City *"
                            required
                        />
                    </div>
                    <div className="form-group third">
                        <input
                            type="text"
                            name="state"
                            value={addressData.state}
                            onChange={handleChange}
                            placeholder="State *"
                            required
                        />
                    </div>
                    <div className="form-group third">
                        <input
                            type="text"
                            name="pincode"
                            value={addressData.pincode}
                            onChange={handleChange}
                            placeholder="Pincode *"
                            pattern="[0-9]{6}"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label htmlFor="deliveryDate">Delivery Date *</label>
                        <input
                            type="date"
                            id="deliveryDate"
                            name="deliveryDate"
                            value={addressData.deliveryDate}
                            onChange={handleChange}
                            min={minDate}
                            max={maxDateStr}
                            required
                        />
                    </div>
                    <div className="form-group half">
                        <label htmlFor="timeSlot">Preferred Time Slot *</label>
                        <select
                            id="timeSlot"
                            name="timeSlot"
                            value={addressData.timeSlot}
                            onChange={handleChange}
                            required
                        >
                            {timeSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button type="submit" className="submit-btn">
                    Proceed to Payment
                </button>
            </form>
        </div>
    );
};

export default Address;
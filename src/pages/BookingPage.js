// src/pages/BookingPage.js
import React, { useState } from 'react';
import './BookingPage.css';

const brands = [
  { id: 'HP GAS', name: 'HP Gas', img: '/images/hp_logo.jpg' },
  { id: 'INDIAN OIL GAS', name: 'Indian Oil', img: '/images/IndianOil.png' },
];

const weights = [
  { label: '5 KG', value: '5kg', price: 500 },
  { label: '10 KG', value: '10kg', price: 900 },
];

const BookingPage = () => {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState('');
  const [cylinderCount, setCylinderCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const handleBrandSelect = (brandId) => {
    setSelectedBrand(brandId);
  };

  const handleWeightChange = (e) => {
    const weight = e.target.value;
    setSelectedWeight(weight);
    calculatePrice(weight, cylinderCount);
  };

  const handleQuantityChange = (e) => {
    const count = parseInt(e.target.value);
    setCylinderCount(count);
    calculatePrice(selectedWeight, count);
  };

  const calculatePrice = (weight, count) => {
    const weightObj = weights.find((w) => w.value === weight);
    const price = weightObj ? weightObj.price * count : 0;
    setTotalPrice(price);
  };

  const handleProceed = () => {
    alert(
      `Proceeding with booking for ${cylinderCount} cylinder(s) of ${selectedWeight} from ${selectedBrand}`
    );
  };

  return (
    <div className="booking-overlay">
      <div className="booking-box">
        <h2>Select Booking Option</h2>

        <div className="option-group">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className={`option ${selectedBrand === brand.id ? 'selected' : ''}`}
              onClick={() => handleBrandSelect(brand.id)}
            >
              <img src={brand.img} alt={brand.name} />
              <p>{brand.name}</p>
            </div>
          ))}
        </div>

        <div className="selectors">
          <div className="selector">
            <label htmlFor="weightSelect">Weight</label>
            <select id="weightSelect" value={selectedWeight} onChange={handleWeightChange}>
              <option value="">Select Weight</option>
              {weights.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
          </div>

          <div className="selector">
            <label htmlFor="quantitySelect">Cylinder Count</label>
            <select id="quantitySelect" value={cylinderCount} onChange={handleQuantityChange}>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="summary">
          <p><strong>Total Price:</strong> ₹{totalPrice}</p>
          <button className="proceed-btn" onClick={handleProceed}>Proceed</button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

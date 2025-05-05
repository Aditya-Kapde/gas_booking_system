import React from 'react';
import './home.css';

const home = () => {
  return (
    <div className="homepage-container">
      <div className="card">
        <h2 className="card-title">Book New Cylinder</h2>
        <ul className="card-list">
          <li>Select type of cylinder</li>
          <li>Address, date and time</li>
          <li>Payment</li>
        </ul>
        <button className="card-button">Book Now</button>
      </div>

      <div className="card">
        <h2 className="card-title">Orders</h2>
        <ul className="card-list">
          <li>Track your orders</li>
          <li>See all previous orders</li>
          <li>Register a complaint</li>
        </ul>
        <button className="card-button">See Details</button>
      </div>
    </div>
  );
};

export default home;

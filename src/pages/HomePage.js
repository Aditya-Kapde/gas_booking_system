import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

const HomePage = () => {
  return (
    <div className="homepage-container">
      <div className="card">
        <h2 className="card-title">Book New Cylinder</h2>
        <ul className="card-list">
          <li>Select type of cylinder</li>
          <li>Address, date and time</li>
          <li>Payment</li>
        </ul>
        <Link to="/booking">
  <button className="card-button">Book Now</button>
</Link>
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

export default HomePage;

// src/pages/Countdown.js
import React from 'react';
import CountdownTimer from '../components/CountdownTimer';

function Countdown() {
  // Replace with your target date
  const targetDate = '2024-12-31T00:00:00';

  return (
    <div style={{ padding: '20px', textAlign: 'center'}}>
      <h1>Countdown to Special Occasion</h1>
      <CountdownTimer targetDate={targetDate} />
    </div>
  );
}

export default Countdown;

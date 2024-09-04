// src/pages/Mistakes.js
import React from 'react';
import PostForm from '../components/PostForm';

function Mistakes() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', alignContent: 'center'}}>
      <h1>Welcome to Our Special Page</h1>
      <PostForm category="mistakes" />
    </div>
  );
}

export default Mistakes;

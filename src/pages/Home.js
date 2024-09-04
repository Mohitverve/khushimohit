import React from 'react';
import PostForm from '../components/PostForm';

import '../styles/home.css'; // Ensure to create this CSS file

function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Our Special Page</h1>
      <div className="forms-container">
        <div className="post-form">
          <PostForm category="home" />
        </div>
        
      </div>
    </div>
  );
}

export default Home;

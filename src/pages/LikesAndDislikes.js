// src/pages/LikesAndDislikes.js
import React from 'react';
import PostForm from '../components/PostForm';

function LikesAndDislikes() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to Our Special Page</h1>
      <PostForm category="likesAndDislikes" />
    </div>
  );
}

export default LikesAndDislikes;

// src/components/Favorites.js
import React from 'react';
import { List, Card } from 'antd';

const favoriteItems = ['Chocolates', 'Ice-creams', 'Music', 'outfits', 'Foods', 'Mohit'];

function Favorites() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Her Favorite Items</h2>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={favoriteItems}
        renderItem={(item) => (
          <List.Item>
            <Card>{item}</Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default Favorites;

// src/components/Songs.js
import React from 'react';
import { List, Card } from 'antd';

const favoriteSongs = ['Song 1', 'Song 2', 'Song 3', 'Song 4', 'Song 5'];

function Songs() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Her Favorite Songs</h2>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={favoriteSongs}
        renderItem={(item) => (
          <List.Item>
            <Card>{item}</Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default Songs;

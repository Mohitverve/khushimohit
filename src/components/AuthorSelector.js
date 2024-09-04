// src/components/AuthorSelector.js
import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

function AuthorSelector({ author, setAuthor }) {
  return (
    <Select
      value={author}
      onChange={(value) => setAuthor(value)}
      placeholder="Select author"
      style={{ width: '100%', marginBottom: '10px' }}
    >
      <Option value="Bubu">Bubu</Option>
      <Option value="Dudu">Dudu</Option>
    </Select>
  );
}

export default AuthorSelector;

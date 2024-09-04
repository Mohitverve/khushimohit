import React, { useState } from "react";
import { Button, Select, Spin } from 'antd';

// Categories and predefined prompts
const promptCategories = {
  romantic: [
    "The stars aligned as...",
    "Their hearts beat in unison when...",
    "Under the moonlit sky, they...",
  ],
  fantasy: [
    "In the mystical forest of Eldoria, ...",
    "The dragon's roar echoed as...",
    "With a wave of the wand, the world...",
  ],
  adventure: [
    "On the brink of the mountain peak, ...",
    "The compass pointed true as...",
    "With a map in hand, they ventured into...",
  ],
  // Add more categories as needed
};

const Prompts = ({ onSelectPrompt }) => {
  const [selectedCategory, setSelectedCategory] = useState("romantic");
  const [randomPrompt, setRandomPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePrompt = () => {
    setLoading(true);
    const prompts = promptCategories[selectedCategory];
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    setRandomPrompt(prompt);
    onSelectPrompt(prompt);
    setLoading(false);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  return (
    <div>
      <Select 
        value={selectedCategory} 
        style={{ width: 120, marginRight: '10px' }} 
        onChange={handleCategoryChange}
      >
        <Select.Option value="romantic">Romantic</Select.Option>
        <Select.Option value="fantasy">Fantasy</Select.Option>
        <Select.Option value="adventure">Adventure</Select.Option>
      </Select>
      <Button 
        type="primary" 
        onClick={generatePrompt} 
        style={{ marginRight: '10px' }}
      >
        Generate Prompt
      </Button>
      {loading ? <Spin /> : randomPrompt && <p>Prompt: {randomPrompt}</p>}
    </div>
  );
};

export default Prompts;

import React, { useState, useEffect } from 'react';
import { Button, Card, Typography } from 'antd';
import { SmileOutlined, CoffeeOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { db } from './firebaseConfig';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import '../styles/pet.css'; // Add your styles here

const { Title } = Typography;

const Pet = () => {
  const [happy, setHappy] = useState(false);
  const [hungry, setHungry] = useState(false);
  const [showFeedOption, setShowFeedOption] = useState(false);
  const [showWalkOption, setShowWalkOption] = useState(false);
  const [walkTaken, setWalkTaken] = useState(false); // New state variable
  const [petResponse, setPetResponse] = useState('');
  const [showPetResponse, setShowPetResponse] = useState(false);

  let timeoutId = null; // Store timeout ID

  const petRef = doc(collection(db, 'pets'), 'myPet');

  useEffect(() => {
    const fetchPetData = async () => {
      const petDoc = await getDoc(petRef);
      if (petDoc.exists()) {
        const petData = petDoc.data();
        setHappy(petData.happy);
        setHungry(petData.hungry);
      }
    };
    fetchPetData();
}, [petRef]); 

  const updatePetData = async (data) => {
    await setDoc(petRef, data);
  };

  const hidePetResponse = () => {
    setShowPetResponse(false);
  };

  const setPetReplyWithTimeout = (message) => {
    setPetResponse(message);
    setShowPetResponse(true);

    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout to hide the response after 3 seconds (3000ms)
    timeoutId = setTimeout(hidePetResponse, 3000);
  };

  const feedPet = () => {
    setHungry(false);
    setHappy(true);
    setPetReplyWithTimeout('Yum! Thank you for the food, Mom!');
    setShowFeedOption(false); // Hide feed option
    updatePetData({ happy: true, hungry: false });
  };

  const playWithPet = () => {
    setHappy(true);
    setPetReplyWithTimeout('Yay! Let\'s play!');
    updatePetData({ happy: true, hungry: hungry });
  };

  const askIfHungry = () => {
    setPetReplyWithTimeout('Yes Mom, I\'m hungry!');
    setShowFeedOption(true);
  };

  const askIfWantsWalk = () => {
    setPetReplyWithTimeout('Yes Mom, I would love to go for a walk!');
    setShowWalkOption(true);
  };

  const handleSadMessage = () => {
    setPetReplyWithTimeout('Aww, don\'t be sad! Here\'s a hug for you! 🤗');
  };

  const takeForWalk = () => {
    setPetReplyWithTimeout('Yay, let\'s go for a walk!');
    setWalkTaken(true); // Hide walk option
  };

  return (
    <Card
      className={`pet-container ${happy ? 'happy' : ''} ${hungry ? 'hungry' : ''}`}
      title={<Title level={2}>Tufyy</Title>}
      actions={[
        <Button
          key="askHungry"
          type="default"
          icon={<SmileOutlined />}
          onClick={askIfHungry}
        >
          Ask if hungry
        </Button>,
        <Button
          key="askWalk"
          type="default"
          icon={<ArrowRightOutlined />}
          onClick={askIfWantsWalk}
        >
          Ask if wants to go for a walk
        </Button>,
        showFeedOption && (
          <Button
            key="feed"
            type="primary"
            icon={<CoffeeOutlined />}
            onClick={feedPet}
          >
            Feed
          </Button>
        ),
        !walkTaken && showWalkOption && (
          <Button
            key="walk"
            type="default"
            icon={<ArrowRightOutlined />}
            onClick={takeForWalk}
          >
            Take for a walk
          </Button>
        ),
        <Button
          key="play"
          type="default"
          icon={<SmileOutlined />}
          onClick={playWithPet}
        >
          Play
        </Button>,
        <Button
          key="sadMessage"
          type="default"
          onClick={handleSadMessage}
        >
          I'm feeling sad
        </Button>
      ]}
    >
      <div className="pet-image-container">
        <img src="/images/pet.png" alt="Virtual Dog" className="pet-image" />
        {showPetResponse && (
          <div className="pet-speech-bubble">
            <p>{petResponse}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Pet;

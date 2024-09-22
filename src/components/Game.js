import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, message, Modal, List, Avatar, Badge } from 'antd';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const questions = [
  { question: "What's the capital of France?", options: [{ text: 'Paris', isCorrect: true }, { text: 'London', isCorrect: false }, { text: 'Berlin', isCorrect: false }, { text: 'Madrid', isCorrect: false }] },
  { question: "What's 2 + 2?", options: [{ text: '3', isCorrect: false }, { text: '4', isCorrect: true }, { text: '5', isCorrect: false }, { text: '6', isCorrect: false }] },
  { question: "What's the largest planet?", options: [{ text: 'Earth', isCorrect: false }, { text: 'Mars', isCorrect: false }, { text: 'Jupiter', isCorrect: true }, { text: 'Saturn', isCorrect: false }] },
  { question: "What's the boiling point of water?", options: [{ text: '100°C', isCorrect: true }, { text: '90°C', isCorrect: false }, { text: '80°C', isCorrect: false }, { text: '110°C', isCorrect: false }] },
  { question: "What's the currency of Japan?", options: [{ text: 'Yen', isCorrect: true }, { text: 'Won', isCorrect: false }, { text: 'Dollar', isCorrect: false }, { text: 'Euro', isCorrect: false }] },
  { question: "Who wrote 'Romeo and Juliet'?", options: [{ text: 'Mark Twain', isCorrect: false }, { text: 'Charles Dickens', isCorrect: false }, { text: 'William Shakespeare', isCorrect: true }, { text: 'Jane Austen', isCorrect: false }] },
  { question: "What's the fastest land animal?", options: [{ text: 'Cheetah', isCorrect: true }, { text: 'Lion', isCorrect: false }, { text: 'Horse', isCorrect: false }, { text: 'Elephant', isCorrect: false }] },
  { question: "What's the main ingredient in guacamole?", options: [{ text: 'Tomato', isCorrect: false }, { text: 'Avocado', isCorrect: true }, { text: 'Onion', isCorrect: false }, { text: 'Pepper', isCorrect: false }] },
  { question: "What planet is known as the Red Planet?", options: [{ text: 'Venus', isCorrect: false }, { text: 'Mars', isCorrect: true }, { text: 'Saturn', isCorrect: false }, { text: 'Jupiter', isCorrect: false }] },
  { question: "How many continents are there?", options: [{ text: '5', isCorrect: false }, { text: '6', isCorrect: false }, { text: '7', isCorrect: true }, { text: '8', isCorrect: false }] },
];
const powerCards = [
  'Apology Card',
  'Skip the Argument Card',
  'Hug Card',
  'Surprise Date Card',
  'Dinner Treat Card',
  'Movie Night Card',
  'Day Off Card',
  'Chores-Free Day Card',
];

const Game = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timer, setTimer] = useState(30);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [userRewards, setUserRewards] = useState([]);
  const [isGameActive, setIsGameActive] = useState(false);
  const [usedCards, setUsedCards] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    if (auth.currentUser) {
      fetchUserData();
    }
  
    if (isGameActive) {
      const interval = setInterval(() => {
        if (timer > 0) {
          setTimer((prev) => prev - 1);
        } else {
          clearInterval(interval);
          handleGameEnd();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [auth.currentUser, fetchUserData, timer, isGameActive]);
  const fetchUserData = async () => {
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      setScore(userData.score || 0);
      setUserRewards(userData.rewards || []);
      setUsedCards(userData.usedCards || []);
    } else {
      await setDoc(userDocRef, { score: 0, rewards: [], usedCards: [] });
    }
  };

  const handleAnswer = async (isCorrect) => {
    if (isCorrect) {
      message.success('Correct answer!');
      setScore((prev) => prev + 1);
      setCorrectAnswers((prev) => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleGameEnd();
    }

    if (correctAnswers + 1 === 10) {
      const reward = powerCards[Math.floor(Math.random() * powerCards.length)];
      message.success(`You won a ${reward}!`);
      setUserRewards((prevRewards) => [...prevRewards, reward]);
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        score: score + 1,
        rewards: [...userRewards, reward],
      });
      setRewardModalVisible(true);
    }
  };

  const handleGameEnd = () => {
    setIsGameActive(false);
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setTimer(30);
  };

  const handleModalClose = () => {
    setRewardModalVisible(false);
  };

  const startGame = () => {
    setIsGameActive(true);
    setTimer(30);
  };

  const markAsUsed = async (card) => {
    setUsedCards((prevUsed) => [...prevUsed, card]);
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      usedCards: [...usedCards, card],
    });
    message.info(`${card} marked as used.`);
  };

  const deleteCard = async (card) => {
    const updatedRewards = userRewards.filter((item) => item !== card);
    setUserRewards(updatedRewards);
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      rewards: updatedRewards,
    });
    message.success(`${card} deleted.`);
  };

  return (
    <Row gutter={16}>
      <Col span={24}>
        <Card title="Quiz Game" bordered={false} style={{ marginBottom: 20 }}>
          {isGameActive ? (
            <>
              <h3>Score: {score}</h3>
              {questions.length > 0 && currentQuestionIndex < questions.length ? (
                <>
                  <h4>{questions[currentQuestionIndex].question}</h4>
                  <div style={{ marginBottom: 10 }}>
                    {questions[currentQuestionIndex].options.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => handleAnswer(option.isCorrect)}
                        type="primary"
                        style={{ marginRight: 10, marginBottom: 10 }}
                      >
                        {option.text}
                      </Button>
                    ))}
                  </div>
                  <h4>Time Left: {timer} seconds</h4>
                </>
              ) : (
                <p>No questions available.</p>
              )}
            </>
          ) : (
            <>
              <h3>Ready to start the game?</h3>
              <Button type="primary" onClick={startGame}>
                Start Game
              </Button>
            </>
          )}
        </Card>
      </Col>

      <Col span={24}>
        <Card title="Your Power Card Collection" bordered={false}>
          <List
            itemLayout="horizontal"
            dataSource={userRewards}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button onClick={() => markAsUsed(item)} disabled={usedCards.includes(item)}>
                    {usedCards.includes(item) ? 'Used' : 'Mark as Used'}
                  </Button>,
                  <Button type="danger" onClick={() => deleteCard(item)}>
                    Delete
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{ backgroundColor: usedCards.includes(item) ? '#f56a00' : '#87d068' }}
                      icon={<span>{item.charAt(0)}</span>}
                    />
                  }
                  title={
                    usedCards.includes(item) ? (
                      <Badge count="Used">
                        <strike>{item}</strike>
                      </Badge>
                    ) : (
                      item
                    )
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>

      <Modal
        title="Congratulations!"
        visible={rewardModalVisible}
        onOk={handleModalClose}
        onCancel={handleModalClose}
      >
        <p>You've won a new power card: {userRewards[userRewards.length - 1]}</p>
      </Modal>
    </Row>
  );
};

export default Game;

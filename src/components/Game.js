  import React, { useState, useEffect, useCallback } from 'react';
  import { Button, Card, Row, Col, message, Modal, List, Avatar, Badge, Select } from 'antd';
  import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';

  // Assume this is the correct path to your questions file
  import allQuestions from '../data/questions.json';

  const { Option } = Select;

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

  const subjects = [
    'Capital Market & Securities Laws',
    'Economic, Commercial and Intellectual Property Laws',
    'Tax Laws & Practice Part I – Direct Tax',
    'Tax Laws & Practice Part II – Indirect Tax',
  ];

  const Game = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState(0);
    const [timer, setTimer] = useState(50);
    const [rewardModalVisible, setRewardModalVisible] = useState(false);
    const [userRewards, setUserRewards] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [usedCards, setUsedCards] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [questions, setQuestions] = useState([]);

    const auth = getAuth();
    const db = getFirestore();

    const fetchUserData = useCallback(async () => {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRewards(userData.rewards || []);
        setUsedCards(userData.usedCards || []);
      } else {
        await setDoc(userDocRef, { rewards: [], usedCards: [] });
      }
    }, [auth.currentUser.uid, db]);

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
    }, [auth.currentUser, timer, isGameActive, fetchUserData]);

    const handleAnswer = async (isCorrect) => {
      if (isCorrect) {
        message.success('Correct answer!');
        setCorrectAnswers((prev) => prev + 1);
      } else {
        message.error('Wrong answer! Try again.');
        setWrongAnswers((prev) => prev + 1);
      }

      if (correctAnswers + (isCorrect ? 1 : 0) >= 10) {
        handleGameEnd();
      } else if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        handleGameEnd();
      }

      if (correctAnswers + (isCorrect ? 1 : 0) === 10) {
        const chance = Math.random() < 0.6;
        if (chance) {
          const reward = powerCards[Math.floor(Math.random() * powerCards.length)];
          message.success(`You won a ${reward}!`);
          setUserRewards((prevRewards) => [...prevRewards, reward]);
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            rewards: [...userRewards, reward],
          });
          setRewardModalVisible(true);
        } else {
          message.info('No power cards this time!');
        }
      }
    };

    const handleGameEnd = () => {
      setIsGameActive(false);
      setCurrentQuestionIndex(0);
      setCorrectAnswers(0);
      setWrongAnswers(0);
      setTimer(50);
    };

    const handleModalClose = () => {
      setRewardModalVisible(false);
    };

    const startGame = () => {
      if (!selectedSubject) {
        message.error('Please select a subject before starting the game.');
        return;
      }
      
      // Get questions based on the selected subject
      const selectedQuestions = allQuestions[selectedSubject];
      
      if (selectedQuestions && selectedQuestions.length > 0) {
        setIsGameActive(true);
        setTimer(50);
        setCurrentQuestionIndex(0);
        setCorrectAnswers(0);
        setWrongAnswers(0);
        setQuestions(selectedQuestions); // Set questions for the selected subject
      } else {
        message.error('No questions available for this subject.');
      }
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

    const handleSubjectChange = (value) => {
      setSelectedSubject(value);
    };

    return (
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Quiz Game" bordered={false} style={{ marginBottom: 20 }}>
            {!isGameActive && (
              <Select
                style={{ width: 300, marginBottom: 20 }}
                placeholder="Select a subject"
                onChange={handleSubjectChange}
                value={selectedSubject}
              >
                {subjects.map((subject) => (
                  <Option key={subject} value={subject}>
                    {subject}
                  </Option>
                ))}
              </Select>
            )}
            {isGameActive ? (
              <>
                <h4>Subject: {selectedSubject}</h4>
                <h4>Correct Answers: {correctAnswers}</h4>
                <h4>Wrong Answers: {wrongAnswers}</h4>
                <h4>Total Questions: {questions.length}</h4>
                <h4>Time Left: {timer} seconds</h4>
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
                  </>
                ) : (
                  <p>No questions available for this subject.</p>
                )}
              </>
            ) : (
              <>
                <h3>Ready to start the game?</h3>
                <Button type="primary" onClick={startGame} disabled={!selectedSubject}>
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
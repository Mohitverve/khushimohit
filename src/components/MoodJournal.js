import React, { useState, useEffect } from 'react';
import { Button, Card, Space, List, Typography, message } from 'antd';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import '../styles/mood.css';  // Add your custom CSS here for flower animation and styling
import { db } from '../components/firebaseConfig'; // Update the import to use 'db' instead of 'firestore'

const MoodJournal = () => {
  const [mood, setMood] = useState(null);
  const [moodLogs, setMoodLogs] = useState([]);
  const [showFlower, setShowFlower] = useState(false);

  const handleMoodSubmit = async () => {
    try {
      await addDoc(collection(db, 'moods'), { mood, timestamp: new Date() });
      message.success('Mood logged successfully!');
      setMood(null);

      if (mood === 'Down') {
        setShowFlower(true);
        setTimeout(() => setShowFlower(false), 5000); // Hide flower after 5 seconds
      }
    } catch (error) {
      message.error('Failed to log mood.');
    }
  };

  const deleteMood = async (id) => {
    try {
      await deleteDoc(doc(db, 'moods', id));
      message.success('Mood deleted!');
    } catch (error) {
      message.error('Failed to delete mood.');
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'moods'), (snapshot) => {
      setMoodLogs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Card title="Daily Mood Check-in" style={{ marginBottom: '20px', maxWidth: '400px', margin: 'auto' }}>
        <Space>
          <Button type={mood === 'Happy' ? 'primary' : 'default'} onClick={() => setMood('Happy')}>Happy</Button>
          <Button type={mood === 'Okay' ? 'primary' : 'default'} onClick={() => setMood('Okay')}>Okay</Button>
          <Button type={mood === 'Down' ? 'primary' : 'default'} onClick={() => setMood('Down')}>Down</Button>
        </Space>
        <br />
        <Button type="primary" style={{ marginTop: '10px' }} onClick={handleMoodSubmit} disabled={!mood}>Submit Mood</Button>
      </Card>

      <Card title="Monthly Mood Overview" style={{ marginBottom: '20px', maxWidth: '600px', margin: 'auto' }}>
        <List
          itemLayout="horizontal"
          dataSource={moodLogs}
          renderItem={item => (
            <List.Item actions={[<Button type="link" onClick={() => deleteMood(item.id)}>Delete</Button>]}>
              <List.Item.Meta
                title={<Typography.Text>{item.mood}</Typography.Text>}
                description={new Date(item.timestamp.seconds * 1000).toLocaleString()}
              />
            </List.Item>
          )}
        />
      </Card>

      {showFlower && (
        <motion.div
          className="flower-animation"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          🌸 Here’s a virtual flower to brighten your day!
        </motion.div>
      )}

      <footer style={{ marginTop: '40px', fontSize: '14px' }}>For Kiko 💖</footer>
    </div>
  );
};

export default MoodJournal;

import React, { useState, useEffect } from 'react';
import { Button, Card, Space, List, Typography, message, Input, Select, notification, Table } from 'antd';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { db } from '../components/firebaseConfig'; // Import db for Firestore
import '../styles/mood.css';  // Add your custom CSS here
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const { Option } = Select;

const MoodJournal = () => {
  const [mood, setMood] = useState(null);
  const [moodLogs, setMoodLogs] = useState([]);
  const [moodDescription, setMoodDescription] = useState('');
  const [timePeriod, setTimePeriod] = useState('week'); // Default filter to 'week'
  const [showFlower, setShowFlower] = useState(false);
  const [messageContent, setMessageContent] = useState('');

  // New period tracker state
  const [periodStartDate, setPeriodStartDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28); // Default cycle length in days
  const [periodLogs, setPeriodLogs] = useState([]); // State to store period logs

  const handleMoodSubmit = async () => {
    try {
      await addDoc(collection(db, 'moods'), { mood, description: moodDescription, timestamp: new Date() });
      message.success('Mood logged successfully!');
      setMood(null);
      setMoodDescription(''); // Clear the description input after submission

      if (mood === 'Down') {
        setShowFlower(true);
        setTimeout(() => setShowFlower(false), 5000); // Hide flower after 5 seconds
      }

      // Set motivational message
      if (mood === 'Happy') {
        setMessageContent('Wow, you\'re doing super good, proud of you! 🤗');
      } else if (mood === 'Okay') {
        setMessageContent('Hugs and kisses for you! 🤗😘');
      } else if (mood === 'Down') {
        setMessageContent('Hugs, kisses, and a rose for you! 🤗😘🌹');
      }
      
      // Clear message after 5 seconds
      setTimeout(() => setMessageContent(''), 5000);
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

  const deletePeriodLog = async (id) => {
    try {
      await deleteDoc(doc(db, 'periods', id));
      message.success('Period log deleted!');
    } catch (error) {
      message.error('Failed to delete period log.');
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'moods'), (snapshot) => {
      setMoodLogs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'periods'), (snapshot) => {
      setPeriodLogs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  // Filter mood logs based on selected time period
  const filteredLogs = moodLogs.filter(log => {
    const logDate = new Date(log.timestamp.seconds * 1000);
    const now = new Date();
    if (timePeriod === 'week') return logDate > new Date(now.setDate(now.getDate() - 7));
    if (timePeriod === 'month') return logDate > new Date(now.setMonth(now.getMonth() - 1));
    return true;
  });

  // Mood data for graph
  const moodData = filteredLogs.map((log) => ({ date: new Date(log.timestamp.seconds * 1000).toLocaleDateString(), mood: log.mood }));
  const chartData = {
    labels: moodData.map((data) => data.date),
    datasets: [
      {
        label: 'Mood Tracker',
        data: moodData.map((data) => data.mood === 'Happy' ? 3 : data.mood === 'Okay' ? 2 : 1),
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      }
    ],
  };

  // Celebrate mood milestones
  useEffect(() => {
    const happyMoods = moodLogs.filter(log => log.mood === 'Happy');
    if (happyMoods.length >= 7) {
      message.success('Congrats on 7 Happy days in a row!');
    }
  }, [moodLogs]);

  // Daily reminder to log mood
  useEffect(() => {
    const notify = () => {
      notification.open({
        message: 'Mood Reminder',
        description: 'Don’t forget to log your mood today!',
      });
    };
    const interval = setInterval(notify, 86400000); // Remind every 24 hours
    return () => clearInterval(interval);
  }, []);

  const handlePeriodSubmit = async () => {
    if (periodStartDate) {
      const startDate = new Date(periodStartDate);
      const nextPeriodDate = new Date(startDate);
      nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength); // Calculate next period date
      
      message.info(`Your next period is expected on: ${nextPeriodDate.toDateString()}`);
      
      // Log the next period date in Firestore
      try {
        await addDoc(collection(db, 'periods'), {
          startDate: startDate.toDateString(),
          cycleLength: cycleLength,
          nextPeriodDate: nextPeriodDate.toDateString(),
          timestamp: new Date(),
        });
        message.success('Period tracking data logged successfully!');
      } catch (error) {
        message.error('Failed to log period data.');
      }
    } else {
      message.warning('Please select a start date for your last period.');
    }
  };
  
  // Period log table columns
  const columns = [
    {
      title: 'Period Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'Cycle Length (days)',
      dataIndex: 'cycleLength',
      key: 'cycleLength',
    },
    {
      title: 'Next Period Date',
      dataIndex: 'nextPeriodDate',
      key: 'nextPeriodDate',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => deletePeriodLog(record.id)} danger>Delete</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', textAlign: 'left', margin: 'auto', maxWidth: '1200px' }}>
      {/* Mood Input Section */}
      <Card title="Daily Mood Check-in" style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <Space>
          <Button type={mood === 'Happy' ? 'primary' : 'default'} onClick={() => setMood('Happy')}>Happy</Button>
          <Button type={mood === 'Okay' ? 'primary' : 'default'} onClick={() => setMood('Okay')}>Okay</Button>
          <Button type={mood === 'Down' ? 'primary' : 'default'} onClick={() => setMood('Down')}>Down</Button>
        </Space>
        <Input.TextArea
          value={moodDescription}
          onChange={(e) => setMoodDescription(e.target.value)}
          placeholder="Describe your mood..."
          style={{ marginTop: '10px' }}
        />
        <Button type="primary" style={{ marginTop: '10px' }} onClick={handleMoodSubmit} disabled={!mood}>Submit Mood</Button>
      </Card>

      {/* Motivational Message */}
      {messageContent && (
        <motion.div
          className="message-animation"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          style={{ marginBottom: '20px', textAlign: 'center', fontSize: '18px' }}
        >
          {messageContent}
        </motion.div>
      )}

      {/* Mood Logs with Filter */}
      <Card title="Monthly Mood Overview" style={{ marginBottom: '20px' }}>
        <Select value={timePeriod} onChange={setTimePeriod} style={{ marginBottom: '10px' }}>
          <Option value="week">Last 7 days</Option>
          <Option value="month">Last 30 days</Option>
        </Select>
        <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
      </Card>

      {/* Period Tracker */}
      <Card title="Period Tracker" style={{ marginBottom: '20px', maxWidth: '500px' }}>
        <Input
          type="date"
          value={periodStartDate}
          onChange={(e) => setPeriodStartDate(e.target.value)}
          placeholder="Start date of your last period"
          style={{ marginBottom: '10px' }}
        />
        <Input
          type="number"
          value={cycleLength}
          onChange={(e) => setCycleLength(parseInt(e.target.value, 10))}
          placeholder="Cycle length in days"
          style={{ marginBottom: '10px' }}
        />
        <Button type="primary" onClick={handlePeriodSubmit}>Track Period</Button>
      </Card>

      {/* Period Logs Table */}
      <Card title="Period Logs" style={{ marginTop: '20px' }}>
        <Table dataSource={periodLogs} columns={columns} rowKey="id" />
      </Card>

      {/* Virtual Flower */}
      {showFlower && (
        <div className="virtual-flower">
          <img src="path_to_flower_image" alt="Flower" style={{ width: '100px' }} />
        </div>
      )}
    </div>
  );
};

export default MoodJournal;

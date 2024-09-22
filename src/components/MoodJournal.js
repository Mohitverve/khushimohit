import React, { useState, useEffect } from 'react';
import { Button, Card, Space, message, Input, Select, notification, Table } from 'antd';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { db } from '../components/firebaseConfig';
import '../styles/mood.css';
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
  const [timePeriod, setTimePeriod] = useState('week');
  const [messageContent, setMessageContent] = useState('');

  const [periodStartDate, setPeriodStartDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLogs, setPeriodLogs] = useState([]);

  const handleMoodSubmit = async () => {
    try {
      await addDoc(collection(db, 'moods'), { mood, description: moodDescription, timestamp: new Date() });
      message.success('Mood logged successfully!');
      setMood(null);
      setMoodDescription('');

      // Set motivational message
      if (mood === 'Happy') {
        setMessageContent('Wow, you\'re doing super good, proud of you! 🤗');
      } else if (mood === 'Okay') {
        setMessageContent('Hugs and kisses for you! 🤗😘');
      } else if (mood === 'Down') {
        setMessageContent('Hugs, kisses, and a rose for you! 🤗😘🌹');
      }
      
      setTimeout(() => setMessageContent(''), 5000);
    } catch (error) {
      message.error('Failed to log mood.');
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

  const filteredLogs = moodLogs.filter(log => {
    const logDate = new Date(log.timestamp.seconds * 1000);
    const now = new Date();
    if (timePeriod === 'week') return logDate > new Date(now.setDate(now.getDate() - 7));
    if (timePeriod === 'month') return logDate > new Date(now.setMonth(now.getMonth() - 1));
    return true;
  });

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

  useEffect(() => {
    const happyMoods = moodLogs.filter(log => log.mood === 'Happy');
    if (happyMoods.length >= 7) {
      message.success('Congrats on 7 Happy days in a row!');
    }
  }, [moodLogs]);

  useEffect(() => {
    const notify = () => {
      notification.open({
        message: 'Mood Reminder',
        description: 'Don’t forget to log your mood today!',
      });
    };
    const interval = setInterval(notify, 86400000);
    return () => clearInterval(interval);
  }, []);

  const handlePeriodSubmit = async () => {
    if (periodStartDate) {
      const startDate = new Date(periodStartDate);
      const nextPeriodDate = new Date(startDate);
      nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
      
      message.info(`Your next period is expected on: ${nextPeriodDate.toDateString()}`);
      
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

      {messageContent && (
        <motion.div
          className="message-animation"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <h3>{messageContent}</h3>
        </motion.div>
      )}

      <Card title="Mood Tracker" style={{ marginBottom: '20px' }}>
        <Select value={timePeriod} onChange={setTimePeriod} style={{ width: '200px', marginBottom: '10px' }}>
          <Option value="week">Last Week</Option>
          <Option value="month">Last Month</Option>
          <Option value="all">All Time</Option>
        </Select>
        <Line data={chartData} />
      </Card>

      <Card title="Period Tracker" style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <Space direction="vertical">
          <Input
            type="date"
            value={periodStartDate}
            onChange={(e) => setPeriodStartDate(e.target.value)}
            placeholder="Last Period Start Date"
          />
          <Input
            type="number"
            value={cycleLength}
            onChange={(e) => setCycleLength(e.target.value)}
            placeholder="Cycle Length (days)"
            min="20"
            max="40"
          />
          <Button type="primary" onClick={handlePeriodSubmit}>Submit</Button>
        </Space>
      </Card>

      <Card title="Period Logs" style={{ marginBottom: '20px' }}>
        <Table columns={columns} dataSource={periodLogs} pagination={false} />
      </Card>
    </div>
  );
};

export default MoodJournal;

import React, { useState, useEffect } from 'react';
import { Table, Input, Button, TimePicker, message } from 'antd';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../components/firebaseConfig'; // Adjust the import based on your file structure
import 'antd/dist/reset.css'; // Import Ant Design styles
import '../styles/count.css';




function CountdownTimer() {
  const [occasionName, setOccasionName] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [time, setTime] = useState(null);
  const [timers, setTimers] = useState([]);

  useEffect(() => {
    // Load timers from Firestore when the component mounts
    const q = collection(db, 'timers');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const timersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        targetDate: new Date(doc.data().targetDate), // Convert string to Date object
        timeLeft: calculateTimeLeft(new Date(doc.data().targetDate)), // Calculate time left
      }));

      setTimers(timersData);

      // Check each timer and trigger a notification if time is up
      timersData.forEach(timer => {
        if (timer.timeLeft === 'Event has passed') {
          
        }
      });
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const calculateTimeLeft = (targetDate) => {
    const now = new Date();
    const difference = +new Date(targetDate) - +now;

    if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return `${days} days left`;
        } else if (hours > 0) {
            return `${hours} hours left`;
        } else {
            return `${minutes} minutes left`;
        }
    } else {
        return 'Event has passed';
    }
};




const handleAddTimer = async () => {
  if (occasionName && targetDate) {
      // Ensure targetDate is in the correct format
      let dateTime = new Date(targetDate);
      
      // Check if time is provided and valid
      if (time) {
          const [hours, minutes] = time.format('HH:mm').split(':');
          dateTime.setHours(hours);
          dateTime.setMinutes(minutes);
      }

      // Check if dateTime is valid before converting to ISO string
      if (!isNaN(dateTime.getTime())) {
          const newTimer = {
              occasionName,
              targetDate: dateTime.toISOString(), // Store as ISO string including time
              time: time ? time.format('HH:mm') : '',
          };

          try {
              await addDoc(collection(db, 'timers'), newTimer);
              setOccasionName('');
              setTargetDate('');
              setTime(null);
              message.success('Timer added successfully!');
          } catch (error) {
              console.error('Error adding timer:', error);
              message.error('Failed to add timer.');
          }
      } else {
          message.error('Invalid date or time provided.');
      }
  } else {
      message.warning('Please enter occasion name and date.');
  }
};


  const handleEditTimer = async (id) => {
    const updatedTimers = timers.map((timer) =>
      timer.id === id
        ? {
            ...timer,
            occasionName,
            targetDate: new Date(targetDate).toISOString(),
            time: time ? time.format('HH:mm') : '',
          }
        : timer
    );

    const timerToUpdate = updatedTimers.find((timer) => timer.id === id);
    try {
      await updateDoc(doc(db, 'timers', id), timerToUpdate);
      setTimers(updatedTimers);
      message.success('Timer updated successfully!');
    } catch (error) {
      console.error('Error updating timer:', error);
      message.error('Failed to update timer.');
    }
  };

  const handleDeleteTimer = async (id) => {
    try {
      await deleteDoc(doc(db, 'timers', id));
      setTimers(timers.filter(timer => timer.id !== id));
      message.success('Timer deleted successfully!');
    } catch (error) {
      console.error('Error deleting timer:', error);
      message.error('Failed to delete timer.');
    }
  };

  const columns = [
    {
      title: 'Occasion Name',
      dataIndex: 'occasionName',
      key: 'occasionName',
    },
    {
      title: 'Date',
      dataIndex: 'targetDate',
      key: 'targetDate',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Countdown',
      dataIndex: 'timeLeft',
      key: 'timeLeft',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button onClick={() => handleEditTimer(record.id)} style={{ marginRight: 8 }}>Edit</Button>
          <Button onClick={() => handleDeleteTimer(record.id)} danger>Delete</Button>
        </span>
      ),
    },
  ];

  return (
    <div className='count'>
      <Input
        placeholder="Occasion Name"
        value={occasionName}
        onChange={(e) => setOccasionName(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Input
        type="date"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <TimePicker
        value={time}
        onChange={(time) => setTime(time)}
        format="HH:mm"
        style={{ marginBottom: 16 }}
      />
      <Button type="primary" onClick={handleAddTimer} style={{ marginBottom: 16 }}>
        Add Timer
      </Button>

      <Table
        columns={columns}
        dataSource={timers}
        rowKey="id"
      />
    </div>
  );
}

export default CountdownTimer;

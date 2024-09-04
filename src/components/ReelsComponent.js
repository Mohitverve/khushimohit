import React, { useState, useEffect } from 'react';
import { Button, Input, List, Card, notification, Spin } from 'antd';
import { collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { EyeOutlined, DeleteOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { db } from '../components/firebaseConfig';
import '../styles/reels.css';

const ReelsComponent = () => {
  const [reels, setReels] = useState([]);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const extractReelId = (url) => {
    const match = url.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const handleAddReel = async () => {
    const reelId = extractReelId(url);
    if (reelId) {
      try {
        await addDoc(collection(db, 'reels'), { reelId, url, name });
        setUrl('');
        setName('');
        fetchReels();
        notification.success({ message: 'Reel added successfully' });
      } catch (error) {
        notification.error({ message: 'Error adding reel', description: error.message });
      }
    } else {
      notification.error({ message: 'Invalid URL', description: 'Please enter a valid Instagram Reel URL' });
    }
  };

  const fetchReels = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'reels'));
      const fetchedReels = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReels(fetchedReels);
    } catch (error) {
      notification.error({ message: 'Error fetching reels', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReel = async (id) => {
    try {
      await deleteDoc(doc(db, 'reels', id));
      fetchReels();
      notification.success({ message: 'Reel deleted successfully' });
    } catch (error) {
      notification.error({ message: 'Error deleting reel', description: error.message });
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  return (
   <div className='Reels'>

    <div className="p-8 max-w-4xl mx-auto bg-gray-100 min-h-screen">
      <div className='Insta'>
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Instagram Reels Dashboard</h1>

      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col items-center">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Instagram Reel URL"
          className="rounded-md mb-4 w-full max-w-md"
          style={{ marginBottom: '20px' }} 
        />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Reel Name"
          className="rounded-md mb-4 w-full max-w-md"
          style={{ marginBottom: '20px' }} 
        />
        <div className='Posts'>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddReel} 
          className="w-full max-w-md h-10 rounded-md bg-blue-500 hover:bg-blue-600 border-none"
          style={{ marginBottom: '40px' }} 
        >
          Add Reel
        </Button>
        </div>
       
      </div>
      {loading ? (
        <div className="text-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <List
          grid={{ gutter: 16, column: 3 }} 
          dataSource={reels}
          renderItem={item => (
            <List.Item>
              <Card
                hoverable
                className="rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => window.open(item.url, '_blank')}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View
                  </Button>,
                 
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteReel(item.id)}
                    className="text-red-500 hover:text-red-700"
                    danger
                  >
                    Delete
                  </Button>
                ]}
              >
                <Card.Meta 
                  title={<span className="text-lg font-semibold">{item.name || 'Instagram Reel'}</span>}
                  description={
                    <span className="text-sm text-gray-500">
                      {item.reelId ? `Reel ID: ${item.reelId}` : 'Invalid Reel ID'}
                    </span>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
    </div>

  );
};

export default ReelsComponent;

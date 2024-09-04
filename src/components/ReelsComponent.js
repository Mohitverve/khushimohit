import React, { useState, useEffect } from 'react';
import { Button, Input, List, Card, notification, Spin } from 'antd';
import { EyeOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
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
    <div className="Reels">
      <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-center">Instagram Reels Dashboard</h1>
        

        <Card className="mb-6">
            <div className='reels'>
            <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter Instagram Reel URL"
            className="mb-4"
          />
            </div>
         
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Reel Name"
            className="mb-6"
          />
          <div className='Button'>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddReel} 
            className="w-full"
          >
            Add Reel
          </Button>
          </div>
          
        </Card>

        {loading ? (
          <div className="text-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
            dataSource={reels}
            renderItem={item => (
              <List.Item>
                <Card
                  actions={[
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      View
                    </Button>,
                    <Button
                      type="link"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteReel(item.id)}
                      danger
                    >
                      Delete
                    </Button>
                  ]}
                >
                  <Card.Meta 
                    title={item.name || 'Instagram Reel'}
                    description={`Reel ID: ${item.reelId || 'Invalid Reel ID'}`}
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
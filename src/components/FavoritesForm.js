import React, { useState, useEffect } from 'react';
import { Input, Button, Card, Row, Col, Popconfirm, Modal, message } from 'antd';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../components/firebaseConfig';

function FavoritesForm() {
  const [favorites, setFavorites] = useState([]);
  const [itemName, setItemName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Load favorite items from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'favorites'), (snapshot) => {
      const favoritesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFavorites(favoritesData);
    });

    return () => unsubscribe();
  }, []);

  // Get the currently authenticated user's information
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthor(user.displayName || user.email); // Set author to the user's display name or email
      }
    });

    return () => unsubscribe();
  }, []);

  const addFavorite = async () => {
    if (itemName && author) {
      try {
        await addDoc(collection(db, 'favorites'), {
          name: itemName,
          imageUrl: imageUrl,
          author: author, // Save author information
          timestamp: new Date(),
        });
        setItemName('');
        setImageUrl('');
        message.success('Favorite added successfully!');
      } catch (error) {
        console.error('Error adding favorite:', error);
        message.error('Error adding favorite');
      }
    } else {
      message.warning('Please enter the favorite item name!');
    }
  };

  const deleteFavorite = async (id) => {
    try {
      await deleteDoc(doc(db, 'favorites', id));
      message.success('Favorite deleted!');
    } catch (error) {
      console.error('Error deleting favorite:', error);
      message.error('Error deleting favorite');
    }
  };

  const showModal = (image) => {
    setSelectedImage(image);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedImage('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Favorite Items</h2>
      <Card style={{ marginBottom: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Add your favorite item..."
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Add image URL..."
            style={{ width: '100%', marginBottom: '10px' }}
          />
          {/* Image Preview */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
                marginBottom: '10px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              }}
            />
          )}
          <Button type="primary" onClick={addFavorite} block>
            Add Favorite
          </Button>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {favorites.map((item) => (
          <Col xs={24} sm={12} md={8} key={item.id}>
            <Card
              hoverable
              style={{
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                height: '300px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              cover={
                <img
                  alt={item.name}
                  src={item.imageUrl}
                  style={{
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '10px 10px 0 0',
                    cursor: 'pointer',
                  }}
                  onClick={() => showModal(item.imageUrl)} // Show modal on image click
                />
              }
            >
              <Card.Meta title={item.name} description={`Added by ${item.author}`} style={{ textAlign: 'center' }} />
              <Popconfirm
                title="Are you sure to delete this favorite?"
                onConfirm={() => deleteFavorite(item.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  style={{
                    color: 'red',
                    textAlign: 'center',
                    display: 'block',
                    margin: '10px auto 0', // Center the delete button
                  }}
                >
                  Delete
                </Button>
              </Popconfirm>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal visible={isModalVisible} footer={null} onCancel={handleCancel} centered>
        <img alt="Selected" src={selectedImage} style={{ width: '100%' }} />
      </Modal>
    </div>
  );
}

export default FavoritesForm;

import React, { useState, useEffect } from 'react';
import { Upload, Button, Card, message, Row, Col, Modal, Input, Form } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, db } from './firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const Media = () => {
  const [media, setMedia] = useState([]);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [previewType, setPreviewType] = useState('');
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [caption, setCaption] = useState('');

  // Handle file upload
  const handleUpload = async () => {
    if (!file || !name || !caption) {
      message.error('Please provide a file, name, and caption.');
      return;
    }
    
    const storageRef = ref(storage, `media/${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Save media details to Firestore
      await addDoc(collection(db, 'media'), {
        name,
        caption,
        url,
        type: file.name.split('.').pop().toLowerCase(),
        createdAt: new Date()
      });

      message.success('Upload successful!');
      setName('');
      setCaption('');
      setFile(null);
      await fetchMedia();
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Upload failed.');
    }
  };

  // Fetch media from Firestore
  const fetchMedia = async () => {
    try {
      const mediaCollection = collection(db, 'media');
      const mediaSnapshot = await getDocs(mediaCollection);
      const mediaList = mediaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedia(mediaList);
    } catch (error) {
      console.error('Error fetching media:', error);
      message.error('Failed to fetch media.');
    }
  };

  // Delete media
  const handleDelete = async (mediaItem) => {
    if (!mediaItem || !mediaItem.id) {
      message.error('Invalid media item');
      return;
    }

    try {
      // Delete the document from Firestore
      const mediaDocRef = doc(db, 'media', mediaItem.id);
      await deleteDoc(mediaDocRef);

      // If the mediaItem has a valid URL, attempt to delete the file from Storage
      if (mediaItem.url) {
        try {
          // Extract the file path from the URL
          const fileUrl = new URL(mediaItem.url);
          const filePath = decodeURIComponent(fileUrl.pathname.split('/o/')[1].split('?')[0]);
          
          const storageRef = ref(storage, filePath);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Don't throw here, as we've already deleted the Firestore document
        }
      }

      message.success('File deleted successfully!');
      await fetchMedia();  // Refresh the media list after deletion
    } catch (error) {
      console.error('Error deleting file:', error);
      message.error('Deletion partially failed. The database entry was removed, but the file may still exist in storage.');
    }
  };

  // Handle media preview
  const handlePreview = (url, type) => {
    setPreviewMedia(url);
    setPreviewType(type);
  };

  // Load media on component mount
  useEffect(() => {
    fetchMedia();
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Our Media</h2>
      <Form layout="vertical" style={{ marginBottom: '20px' }}>
        <Form.Item label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter media name" />
        </Form.Item>
        <Form.Item label="Caption">
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Enter caption" />
        </Form.Item>
        <Form.Item>
          <Upload
            accept="image/*,video/*"
            beforeUpload={(file) => {
              setFile(file);
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleUpload}>
            Upload Image/Video
          </Button>
        </Form.Item>
      </Form>

      <Row gutter={16}>
        {media.map((item) => (
          <Col span={8} key={item.id}>
            <Card
              cover={
                item.type.match(/(jpg|jpeg|png|gif)$/) ? (
                  <img
                    src={item.url}
                    alt={`media-${item.id}`}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => handlePreview(item.url, 'image')}
                  />
                ) : (
                  <video
                    src={item.url}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                )
              }
              actions={[
                <DeleteOutlined key="delete" onClick={() => handleDelete(item)} style={{ color: 'red' }} />,
                <EyeOutlined key="view" onClick={() => handlePreview(item.url, item.type)} />,
              ]}
              style={{ borderRadius: '8px', overflow: 'hidden' }}
            >
              <Card.Meta
                title={item.name}
                description={item.caption}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {previewMedia && (
        <Modal
          visible={!!previewMedia}
          footer={null}
          onCancel={() => setPreviewMedia(null)}
          centered
          width={800}
        >
          {previewType === 'image' ? (
            <img src={previewMedia} alt="Preview" style={{ width: '100%' }} />
          ) : (
            <video 
              src={previewMedia} 
              style={{ width: '100%' }} 
              controls 
              autoPlay={false}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default Media;
import React, { useState, useEffect } from "react";
import { db, auth } from "../components/firebaseConfig";
import {
  collection,
  addDoc,
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc
} from "firebase/firestore";
import { 
  Button, 
  Input, 
  Modal, 
  message, 
  Card, 
  Upload, 
  Row, 
  Col,
  Typography
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Prompts from "./Prompts";

const { Meta } = Card;
const { Paragraph } = Typography;

const Story = () => {
  const [stories, setStories] = useState([]);
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewStory, setViewStory] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "stories"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storyArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStories(storyArray);
    });
    return () => unsubscribe();
  }, []);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const addToStory = async () => {
    if (input.trim() !== "" && title.trim() !== "") {
      try {
        let thumbnailBase64 = null;
        if (thumbnail) {
          thumbnailBase64 = await convertToBase64(thumbnail);
        }

        const newStory = {
          title: title,
          text: selectedPrompt ? `${selectedPrompt} ${input}` : input,
          timestamp: new Date(),
          user: auth.currentUser ? auth.currentUser.email : "Anonymous",
          thumbnail: thumbnailBase64,
        };

        await addDoc(collection(db, "stories"), newStory);
        setInput("");
        setTitle("");
        setSelectedPrompt("");
        setThumbnail(null);
      } catch (error) {
        console.error("Error adding story:", error);
        message.error("Failed to add to story");
      }
    } else {
      message.warning("Please enter a title and story text");
    }
  };

  const handleEdit = (id, text, title, thumbnail) => {
    setEditingId(id);
    setEditText(text);
    setEditTitle(title);
    setEditThumbnail(thumbnail || "");
    setEditModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "stories", id));
      message.success("Story deleted successfully");
    } catch (error) {
      message.error("Failed to delete the story part");
    }
  };

  const handleUpdate = async () => {
    if (editText.trim() !== "" && editTitle.trim() !== "") {
      try {
        let updatedThumbnail = editThumbnail;

        if (editThumbnail instanceof File) {
          updatedThumbnail = await convertToBase64(editThumbnail);
        }

        const updatedStory = {
          text: editText,
          title: editTitle,
          thumbnail: updatedThumbnail,
        };

        await updateDoc(doc(db, "stories", editingId), updatedStory);

        setEditModalVisible(false);
        resetEditState();
        message.success("Story updated successfully!");
      } catch (error) {
        console.error("Failed to update the story part:", error);
        message.error("Failed to update the story part");
      }
    } else {
      message.warning("Please enter a title and story text");
    }
  };

  const resetEditState = () => {
    setEditingId(null);
    setEditText("");
    setEditTitle("");
    setEditThumbnail(null);
  };

  const handleViewStory = (story) => {
    setViewStory(story);
  };

  const handleCloseView = () => {
    setViewStory(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Love Story Builder</h1>
      <div style={{ marginBottom: '20px' }}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Story Title"
          style={{ marginBottom: '10px' }}
        />
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add to the story..."
          rows={4}
          style={{ marginBottom: '10px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Upload
            beforeUpload={(file) => {
              setThumbnail(file);
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>
              Upload Thumbnail
            </Button>
          </Upload>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Prompts onSelectPrompt={(prompt) => setSelectedPrompt(prompt)} />
            <Button type="primary" onClick={addToStory}>
              Add to Story
            </Button>
          </div>
        </div>
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        {stories.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
              hoverable
              cover={
                item.thumbnail ? (
                  <img
                    alt="thumbnail"
                    src={item.thumbnail}
                    style={{ height: 150, objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ height: 150, backgroundColor: '#f5f5f5' }}></div>
                )
              }
              onClick={() => handleViewStory(item)}
            >
              <Meta title={item.title} description={item.text.substring(0, 100) + '...'} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <Button type="primary" onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(item.id, item.text, item.title, item.thumbnail);
                }}>Edit</Button>
                <Button type="danger" onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}>Delete</Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Modal
        title="Edit Story"
        visible={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => {
          setEditModalVisible(false);
          resetEditState();
        }}
      >
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Story Title"
          style={{ marginBottom: '10px' }}
        />
        <Input.TextArea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder="Edit story text..."
          rows={4}
          style={{ marginBottom: '10px' }}
        />
        <Upload
          beforeUpload={(file) => {
            setEditThumbnail(file);
            return false;
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} style={{ marginBottom: '10px' }}>
            Upload New Thumbnail
          </Button>
        </Upload>
      </Modal>
      {viewStory && (
        <Modal
          visible={true}
          footer={null}
          onCancel={handleCloseView}
          title={viewStory.title}
          width={800}
          bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {viewStory.thumbnail && (
              <img
                alt="thumbnail"
                src={viewStory.thumbnail}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  height: 'auto',
                  marginBottom: '20px',
                  objectFit: 'cover'
                }}
              />
            )}
            <Paragraph
              style={{
                textAlign: 'justify',
                width: '100%',
                fontSize: '16px',
                lineHeight: '1.6'
              }}
            >
              {viewStory.text}
            </Paragraph>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Story;
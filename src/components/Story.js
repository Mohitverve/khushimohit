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
  Typography,
  Select,
  Space
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Meta } = Card;
const { Paragraph } = Typography;
const { Option } = Select;

const Story = () => {
  const [stories, setStories] = useState([]);
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewStory, setViewStory] = useState(null);
  const [promptType, setPromptType] = useState("romantic");

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
          text: input,
          timestamp: new Date(),
          user: auth.currentUser ? auth.currentUser.email : "Anonymous",
          thumbnail: thumbnailBase64,
        };

        await addDoc(collection(db, "stories"), newStory);
        setInput("");
        setTitle("");
        setThumbnail(null);
        message.success("Story added successfully!");
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

  const generatePrompt = () => {
    const prompts = {
      romantic: [
        "It was love at first sight when...",
        "Their hands touched accidentally, and suddenly...",
        "Under the starry sky, they realized...",
      ],
      funny: [
        "Their first date was a disaster because...",
        "They knew it was meant to be when they both...",
        "Love struck in the most unexpected place: ...",
      ],
      mysterious: [
        "The secret admirer left a cryptic message...",
        "A chance encounter at midnight led to...",
        "The old locket held a surprise that would change everything...",
      ],
    };
    
    const selectedPrompts = prompts[promptType] || prompts.romantic;
    const randomPrompt = selectedPrompts[Math.floor(Math.random() * selectedPrompts.length)];
    setInput(randomPrompt);
  };

  return (
    <div style={{ padding: '10px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '15px', textAlign: 'center' }}>Love Story Builder</h1>
      <div style={{ marginBottom: '15px' }}>
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
        <Space direction="vertical" style={{ width: '100%', marginBottom: '10px' }}>
          <Upload
            beforeUpload={(file) => {
              setThumbnail(file);
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} block>
              Upload Thumbnail
            </Button>
          </Upload>
          <Select
            style={{ width: '100%' }}
            placeholder="Select a prompt type"
            onChange={(value) => setPromptType(value)}
            defaultValue="romantic"
          >
            <Option value="romantic">Romantic</Option>
            <Option value="funny">Funny</Option>
            <Option value="mysterious">Mysterious</Option>
          </Select>
          <Space style={{ width: '100%' }}>
            <Button onClick={generatePrompt} style={{ flex: 1 }}>
              Generate Prompt
            </Button>
            <Button type="primary" onClick={addToStory} style={{ flex: 1 }}>
              Add to Story
            </Button>
          </Space>
        </Space>
      </div>
      <Row gutter={[8, 8]}>
        {stories.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
              hoverable
              cover={
                item.thumbnail ? (
                  <img
                    alt="thumbnail"
                    src={item.thumbnail}
                    style={{ height: 120, objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ height: 120, backgroundColor: '#f5f5f5' }}></div>
                )
              }
              onClick={() => handleViewStory(item)}
            >
              <Meta 
                title={item.title} 
                description={
                  <Paragraph ellipsis={{ rows: 2 }}>
                    {item.text}
                  </Paragraph>
                } 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <Button size="small" type="primary" onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(item.id, item.text, item.title, item.thumbnail);
                }}>Edit</Button>
                <Button size="small" danger onClick={(e) => {
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
          width="90%"
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
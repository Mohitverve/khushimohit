import React, { useState, useEffect } from "react";
import { Layout, Tabs, Form, Input, Button, Card, message, Popconfirm, Row, Col } from "antd";
import { db, auth } from "../components/firebaseConfig"; // Adjust the path as needed
import { collection, addDoc, query, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const { Content } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;

const Journal = () => {
  const [form] = Form.useForm();
  const [events, setEvents] = useState({ daily: [], special: [], sad: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    fetchEvents();

    return () => unsubscribe();
  }, []);

  const handleFinish = async (values) => {
    if (!user) {
      message.error("You must be logged in to add events!");
      return;
    }

    console.log("Submitting event:", values);
    try {
      const docRef = await addDoc(collection(db, "events"), {
        type: activeTab,
        description: values.description,
        timestamp: new Date(),
        user: user.uid,
        username: user.displayName,
      });
      console.log("Document added with ID:", docRef.id);

      setEvents((prev) => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), { id: docRef.id, ...values, type: activeTab, user: user.uid, username: user.displayName }],
      }));

      form.resetFields();
      message.success("Event added successfully!");
    } catch (error) {
      console.error("Error adding document:", error);
      message.error("Failed to add event!");
    }
  };

  const fetchEvents = async () => {
    console.log("Fetching events...");
    setLoading(true);
    try {
      const q = query(collection(db, "events"));
      const querySnapshot = await getDocs(q);
      const fetchedEvents = { daily: [], special: [], sad: [] };
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        console.log("Event Data:", eventData);
        const eventType = eventData.type || "unknown";
        if (fetchedEvents[eventType]) {
          fetchedEvents[eventType].push({ id: doc.id, ...eventData });
        } else {
          console.warn(`Unexpected event type: ${eventType}`);
        }
      });
      console.log("Fetched events:", fetchedEvents);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      message.error("Failed to fetch events!");
    }
    setLoading(false);
  };

  const handleDelete = async (id, type) => {
    try {
      await deleteDoc(doc(db, "events", id));
      setEvents((prev) => ({
        ...prev,
        [type]: prev[type].filter((event) => event.id !== id),
      }));
      message.success("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting document:", error);
      message.error("Failed to delete event!");
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    form.setFieldsValue({ type: key });
  };

  return (
    <Layout>
      <Content style={{ padding: '0 20px', marginTop: 64 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: '#ff69b4' }}>Our Love Journal</h2>
          <Row gutter={16}>
            <Col xs={24}>
              <Tabs
                defaultActiveKey="daily"
                onChange={handleTabChange}
                style={{ marginBottom: 20 }}
                tabBarGutter={16}
              >
                <TabPane tab="Daily Events" key="daily">
                  <EventList events={events.daily} loading={loading} onDelete={handleDelete} />
                </TabPane>
                <TabPane tab="Special Events" key="special">
                  <EventList events={events.special} loading={loading} onDelete={handleDelete} />
                </TabPane>
                <TabPane tab="Sad Events" key="sad">
                  <EventList events={events.sad} loading={loading} onDelete={handleDelete} />
                </TabPane>
              </Tabs>
            </Col>
          </Row>
          <Form form={form} onFinish={handleFinish} layout="vertical">
            <Form.Item name="description" label="Event Description" rules={[{ required: true }]}>
              <TextArea rows={4} placeholder="Describe the event..." />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Add Event</Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

const EventList = ({ events, loading, onDelete }) => (
  <div>
    {events.map(item => (
      <Card
        key={item.id}
        style={{ marginBottom: 16 }}
        actions={[
          <Popconfirm
            title="Are you sure you want to delete this event?"
            onConfirm={() => onDelete(item.id, item.type)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        ]}
      >
        <Card.Meta
          title={<span style={{ color: '#ff69b4' }}>{item.username || 'Unknown User'}</span>}
          description={
            <div>
              <p>{item.description}</p>
            </div>
          }
        />
      </Card>
    ))}
  </div>
);

export default Journal;

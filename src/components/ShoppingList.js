import React, { useState, useEffect } from 'react';
import { Input, Button, Table, message, Form, Image, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../components/firebaseConfig';

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [form] = Form.useForm();

  // Load items from Firestore on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, 'shoppingList'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const itemsArray = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(0), // Default to the earliest date if no createdAt
          };
        });

        setItems(itemsArray);
      } catch (error) {
        console.error('Error fetching items: ', error);
        message.error('Failed to load items');
      }
    };

    fetchItems();
  }, []);

  // Add item to the Firestore
  const addItem = async (values) => {
    try {
      const newItem = {
        name: values.name,
        link: values.link,
        image: values.image || '', // Optional image URL
        createdAt: serverTimestamp(), // Add createdAt timestamp
      };

      const docRef = await addDoc(collection(db, 'shoppingList'), newItem);
      setItems([...items, { id: docRef.id, ...newItem, createdAt: new Date() }]); // Assume current time for UI display
      form.resetFields();
      message.success('Item added!');
    } catch (error) {
      console.error('Error adding item: ', error);
      message.error('Failed to add item');
    }
  };

  // Delete item from Firestore
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'shoppingList', id));
      setItems(items.filter((item) => item.id !== id));
      message.success('Item deleted!');
    } catch (error) {
      console.error('Error deleting item: ', error);
      message.error('Failed to delete item');
    }
  };

  // Optional: Update existing items to add a createdAt timestamp
  const updateExistingItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'shoppingList'));
      querySnapshot.forEach(async (document) => {
        const data = document.data();
        if (!data.createdAt) { // Check if createdAt field exists
          await updateDoc(doc(db, 'shoppingList', document.id), {
            createdAt: serverTimestamp(),
          });
        }
      });
      console.log('All items updated with a createdAt timestamp.');
    } catch (error) {
      console.error('Error updating items: ', error);
    }
  };

  useEffect(() => {
    updateExistingItems(); // Uncomment this line to run the update script
  }, []);

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: '20%',
      render: (text, record) =>
        record.image ? (
          <Image
            src={record.image}
            alt={record.name}
            width={80}
            height={80}
            style={{ objectFit: 'cover' }}
          />
        ) : null,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '60%',
      render: (text, record) => (
        <a href={record.link} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this item?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button icon={<DeleteOutlined />} danger>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '24px' }}>Shopping List</h2>
      <Form
        form={form}
        onFinish={addItem}
        layout="vertical"
        style={{ marginBottom: '32px' }}
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please input the item name!' }]}
        >
          <Input placeholder="Item name" />
        </Form.Item>
        <Form.Item
          name="link"
          rules={[{ required: true, message: 'Please input the item link!' }]}
        >
          <Input placeholder="Item link" />
        </Form.Item>
        <Form.Item name="image">
          <Input placeholder="Image URL (optional)" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
            Add Item
          </Button>
        </Form.Item>
      </Form>
      <Table
        dataSource={items}
        columns={columns}
        rowKey={(record) => record.id}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default ShoppingList;

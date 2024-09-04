import React, { useState, useEffect } from 'react';
import { Input, Button, List, Card, Popconfirm, message, Modal } from 'antd';
import { collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../components/firebaseConfig';

function PostForm({ category }) {
  const [posts, setPosts] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('category', '==', category),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        replies: doc.data().replies || [], // Ensure replies is always an array
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, [category]);

  const addPost = async () => {
    if (input && currentUser) {
      setLoading(true);
      try {
        await addDoc(collection(db, 'posts'), {
          message: input,
          timestamp: new Date(),
          category: category,
          author: currentUser.displayName || currentUser.email,
          replies: [],
        });
        setInput('');
        message.success('Post added successfully!');
      } catch (error) {
        console.error('Error adding post:', error);
        message.error('Failed to add post.');
      } finally {
        setLoading(false);
      }
    } else {
      message.warning('Please enter a message.');
    }
  };

  const addReply = async () => {
    if (replyInput && currentUser && selectedPost) {
      try {
        const postRef = doc(db, 'posts', selectedPost.id);
        await updateDoc(postRef, {
          replies: arrayUnion({
            message: replyInput,
            author: currentUser.displayName || currentUser.email,
            timestamp: new Date(),
          }),
        });
        setReplyInput('');
        message.success('Reply added successfully!');
        // Update the selected post with the new reply
        setSelectedPost({
          ...selectedPost,
          replies: [
            ...(selectedPost.replies || []),
            {
              message: replyInput,
              author: currentUser.displayName || currentUser.email,
              timestamp: new Date(),
            },
          ],
        });
      } catch (error) {
        console.error('Error adding reply:', error);
        message.error('Failed to add reply.');
      }
    } else {
      message.warning('Please enter a reply message.');
    }
  };

  const deletePost = async (id) => {
    try {
      await deleteDoc(doc(db, 'posts', id));
      setPosts(posts.filter((post) => post.id !== id));
      message.success('Post deleted successfully!');
      if (selectedPost && selectedPost.id === id) {
        setIsModalVisible(false);
        setSelectedPost(null);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      message.error('Failed to delete post.');
    }
  };

  const showPostDetails = (post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}> {category}</h2>
      <Input.TextArea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Write something..."
        rows={4}
        style={{ borderRadius: '4px' }}
      />
      <Button
        type="primary"
        onClick={addPost}
        style={{ marginTop: '10px', borderRadius: '4px' }}
        loading={loading}
      >
        Post
      </Button>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={posts}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card
              hoverable
              onClick={() => showPostDetails(item)}
              style={{ borderRadius: '8px', backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}
            >
              <p>{item.message}</p>
              <p style={{ fontStyle: 'italic', color: '#555' }}>Posted by: {item.author}</p>
              <span style={{ color: '#888', fontSize: '0.8em' }}>
                {item.timestamp?.toDate?.().toLocaleString() || 'Unknown date'}
              </span>
              <p style={{ marginTop: '10px', color: '#1890ff' }}>
                {item.replies?.length || 0} {(item.replies?.length || 0) === 1 ? 'reply' : 'replies'}
              </p>
            </Card>
          </List.Item>
        )}
        style={{ marginTop: '20px' }}
      />
      <Modal
        title="Post Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Popconfirm
            key="delete"
            title="Are you sure you want to delete this post?"
            onConfirm={() => deletePost(selectedPost?.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete Post</Button>
          </Popconfirm>,
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedPost && (
          <div>
            <Card style={{ marginBottom: '20px' }}>
              <p>{selectedPost.message}</p>
              <p style={{ fontStyle: 'italic', color: '#555' }}>Posted by: {selectedPost.author}</p>
              <span style={{ color: '#888', fontSize: '0.8em' }}>
                {selectedPost.timestamp?.toDate?.().toLocaleString() || 'Unknown date'}
              </span>
            </Card>
            <h4>Replies:</h4>
            <List
              itemLayout="horizontal"
              dataSource={selectedPost.replies || []}
              renderItem={(reply, index) => (
                <List.Item>
                  <List.Item.Meta
                    title={reply.author}
                    description={reply.message}
                  />
                  <div style={{ color: '#888', fontSize: '0.8em' }}>
                    {reply.timestamp?.toDate?.().toLocaleString() || 'Unknown date'}
                  </div>
                </List.Item>
              )}
            />
            <div style={{ marginTop: '20px' }}>
              <Input.TextArea
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                style={{ borderRadius: '4px' }}
              />
              <Button
                type="primary"
                onClick={addReply}
                style={{ marginTop: '10px', borderRadius: '4px' }}
              >
                Submit Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PostForm;

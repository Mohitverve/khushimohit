import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Dropdown, Avatar, Button, Upload, message, Modal } from 'antd';
import { auth, db, storage } from './firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { UserOutlined, EllipsisOutlined, UploadOutlined } from '@ant-design/icons';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Navbar() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    photoURL: '',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserProfile(user.uid);
      } else {
        setUserProfile({ displayName: '', photoURL: '' });
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAvatarUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    const user = auth.currentUser;

    if (user) {
      try {
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, file);

        const downloadURL = await getDownloadURL(storageRef);
        const userRef = doc(db, 'users', user.uid);

        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          await updateDoc(userRef, { photoURL: downloadURL });
        } else {
          await setDoc(userRef, {
            displayName: user.displayName || '',
            photoURL: downloadURL,
          });
        }

        setUserProfile((prevState) => ({ ...prevState, photoURL: downloadURL }));

        message.success('Avatar updated successfully');
        onSuccess('OK');
      } catch (error) {
        console.error('Error uploading avatar:', error);
        message.error('Failed to update avatar');
        onError(error);
      }
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const dropdownMenu = (
    <Menu>
      <Menu.Item key="upload-avatar">
        <Upload customRequest={handleAvatarUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />}>Upload Avatar</Button>
        </Upload>
      </Menu.Item>
      <Menu.Item key="signout" onClick={handleSignOut}>
        Sign Out
      </Menu.Item>
    </Menu>
  );

  const navMenu = (
    <Menu>
      {/* Add your links here */}
    </Menu>
  );

  return (
    <>
      <Menu mode="horizontal" theme="light">
        <Dropdown overlay={navMenu} trigger={['click']}>
          <Button icon={<EllipsisOutlined />} style={{ border: 'none' }} />
        </Dropdown>

        <Dropdown overlay={dropdownMenu} placement="bottomRight">
          <Avatar
            icon={<UserOutlined />}
            src={userProfile.photoURL}
            style={{ cursor: 'pointer', marginLeft: 'auto' }}
            onClick={showModal}
          />
        </Dropdown>
      </Menu>

      <Modal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        title="Avatar Preview"
      >
        <img
          src={userProfile.photoURL}
          alt="User Avatar"
          style={{ width: '100%', height: 'auto' }}
        />
      </Modal>
    </>
  );
}

export default Navbar;

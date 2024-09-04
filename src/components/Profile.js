import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Ensure correct path


const Profile = () => {
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    // Simulating fetching user profile
    setTimeout(() => {
      setBio("I am Khushi's Boyfriend");
      setPhotoURL("/api/placeholder/100/100");
    }, 1000);
  }, []);

  const handleUpload = async () => {
    if (file) {
      setIsUploading(true);
      const auth = getAuth();
      const storage = getStorage();
      const user = auth.currentUser;
  
      try {
        // Upload the file to Firebase Storage
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, file);
  
        // Get the download URL for the uploaded image
        const downloadURL = await getDownloadURL(storageRef);
  
        // Update the user's profile with the new photo URL in Firestore
        await setDoc(doc(db, 'users', user.uid), { photoURL: downloadURL }, { merge: true });
  
        // Update the Firebase Auth profile
        await updateProfile(user, { photoURL: downloadURL });
  
        // Update the local state to reflect the new photo
        setPhotoURL(downloadURL);
        setMessage({ type: 'success', content: 'Profile updated successfully!' });
      } catch (error) {
        setMessage({ type: 'error', content: 'Failed to update profile.' });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '1.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Profile</h2>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="bio" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write something about yourself..."
          style={{ width: '100%', padding: '0.5rem 0.75rem', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '0.375rem', outline: 'none' }}
          rows={4}
        />
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Profile Picture</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {photoURL ? (
            <img src={photoURL} alt="Profile" style={{ width: '6rem', height: '6rem', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '6rem', height: '6rem', backgroundColor: '#E5E7EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.5rem', color: '#9CA3AF' }}>📷</span>
            </div>
          )}
          <label style={{ cursor: 'pointer', backgroundColor: '#3B82F6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', transition: 'background-color 0.3s' }}>
            <span>Upload New Picture</span>
            <input
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>
      
      <button
        onClick={handleUpload}
        disabled={isUploading}
        style={{
          width: '100%',
          backgroundColor: '#10B981',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: 'none',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          opacity: isUploading ? 0.5 : 1,
          transition: 'background-color 0.3s'
        }}
      >
        {isUploading ? 'Saving...' : 'Save Profile'}
      </button>
      
      {message.content && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.375rem',
          backgroundColor: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
          border: `1px solid ${message.type === 'success' ? '#34D399' : '#F87171'}`,
          color: message.type === 'success' ? '#065F46' : '#991B1B'
        }}>
          {message.content}
        </div>
      )}
      
      <p style={{ textAlign: 'center', color: '#6B7280', marginTop: '1.5rem' }}>For Kiko</p>
    </div>
  );
};

export default Profile;
import React, { useState, useEffect } from 'react';
import { Input, Button, Card, Col, Row, message, Popconfirm } from 'antd';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../components/firebaseConfig';
import { CSVLink } from 'react-csv';
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';

function SongsForm() {
  const [songs, setSongs] = useState([]);
  const [input, setInput] = useState('');
  const [songName, setSongName] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'songs'), (snapshot) => {
      const songsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSongs(songsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthor(user.displayName || user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const addSong = async () => {
    if (input && songName && author) {
      try {
        await addDoc(collection(db, 'songs'), {
          name: songName,
          link: input,
          image: thumbnail || '',
          author: author,
          timestamp: new Date(),
        });
        setInput('');
        setSongName('');
        setThumbnail('');
        message.success('Song added successfully!');
      } catch (error) {
        message.error('Error adding song:', error);
      }
    } else {
      message.warning('Please enter song name and Spotify link!');
    }
  };

  const deleteSong = async (id) => {
    try {
      await deleteDoc(doc(db, 'songs', id));
      message.success('Song deleted!');
    } catch (error) {
      message.error('Error deleting song:', error);
    }
  };

  const exportPlaylist = () => {
    return songs.map((song) => ({
      Name: song.name,
      Author: song.author,
      Link: song.link,
      AddedOn: new Date(song.timestamp.toDate()).toLocaleString(),
    }));
  };

  return (
    <div className="songs-container">
      <h2>Favorite Songs</h2>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <Input
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            placeholder="Song name..."
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add Spotify link..."
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Input
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="Thumbnail URL (optional)"
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button type="primary" onClick={addSong} style={{ width: '100%' }}>
            Add Song
          </Button>
        </Col>
      </Row>
      <Button type="default" style={{ marginBottom: '20px' }}>
        <CSVLink data={exportPlaylist()} filename="playlist.csv">
          Export Playlist
        </CSVLink>
      </Button>
      <Row gutter={[16, 16]}>
        {songs.map((song) => (
          <Col key={song.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              className="song-card"
              style={{ borderRadius: '12px', overflow: 'hidden' }}
            >
              <div className="card-thumbnail">
                <img src={song.image} alt="Thumbnail" className="thumbnail-image" />
              </div>
              <div className="card-content">
                <h3 className="song-title">{song.name}</h3>
                <p className="song-author">By: {song.author}</p>
                <a href={song.link} target="_blank" rel="noopener noreferrer" className="listen-link">
                  <PlayCircleOutlined style={{ marginRight: '5px' }} /> Listen
                </a>
                <Popconfirm
                  title="Are you sure to delete this song?"
                  onConfirm={() => deleteSong(song.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link" icon={<DeleteOutlined />} className="delete-button">
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <style jsx>{`
        .songs-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .song-card {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
          border: none;
          text-align: center;
          background: #f8f9fa;
        }
        .song-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
        }
        .card-thumbnail {
          width: 100%;
          height: 150px;
          overflow: hidden;
        }
        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .card-content {
          padding: 15px;
          background-color: #ffffff;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
        }
        .song-title {
          font-size: 1.1em;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .song-author {
          font-size: 0.9em;
          color: #6c757d;
          margin-bottom: 10px;
        }
        .listen-link {
          display: block;
          margin-bottom: 10px;
          color: #007bff;
          font-size: 0.9em;
        }
        .delete-button {
          color: red;
          padding: 0;
        }
      `}</style>
    </div>
  );
}

export default SongsForm;

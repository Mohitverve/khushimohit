// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppFooter from './components/Footer';
import Home from './pages/Home';
import Mistakes from './pages/Mistakes';
import LikesDislikes from './pages/LikesAndDislikes';
import Countdown from './pages/Countdown';
import Media from './components/Media';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

import Songs from './pages/Songs';
import Favourite from './pages/Favourite';
import Profile from './components/Profile';
import Journal from './components/Journal';
import ShoppingList from './components/ShoppingList';
import ReelsComponent from './components/ReelsComponent';
import Story from './components/Story';
// src/index.js or src/App.js
import 'antd/dist/reset.css'; // Reset Ant Design CSS
import MoodJournal from './components/MoodJournal';


function App() {





  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mistakes"
            element={
              <ProtectedRoute>
                <Mistakes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/likes-dislikes"
            element={
              <ProtectedRoute>
                <LikesDislikes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/media"
            element={
              <ProtectedRoute>
                <Media />
              </ProtectedRoute>
            }
          />

          <Route
            path="/countdown"
            element={
              <ProtectedRoute>
                <Countdown />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Favourite"
            element={
              <ProtectedRoute>
                <Favourite />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Songs"
            element={
              <ProtectedRoute>
                <Songs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Journal"
            element={
              <ProtectedRoute>
                <Journal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ShoppingList"
            element={
              <ProtectedRoute>
                <ShoppingList />
              </ProtectedRoute>
            }
          />
           <Route
            path="/ReelsComponent"
            element={
              <ProtectedRoute>
                <ReelsComponent />
              </ProtectedRoute>
            }
          />
           <Route
            path="/Story"
            element={
              <ProtectedRoute>
                <Story />
              </ProtectedRoute>
            }
          />
          <Route
            path="/MoodJournal"
            element={
              <ProtectedRoute>
                <MoodJournal />
              </ProtectedRoute>
            }
          />
        </Routes>
        <AppFooter />
      </div>
    </Router>
  );
}

export default App;

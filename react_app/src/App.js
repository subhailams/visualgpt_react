import React from 'react';
import { ChatContextProvider } from './context/chatContext';
import SideBar from './components/SideBar';
import MainChat from './components/MainChat';
import AnnotationPage from './components/AnnotationPage'; // Import AnnotationPage

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Routes and Route

const App = () => {
  return (
    <ChatContextProvider>
      <Router>
        <div className='flex transition duration-500 ease-in-out'>
          <SideBar />
          <Routes>
            <Route path="/" element={<MainChat />} />
            <Route path="/annotate/:imageUrl" element={<AnnotationPage />} /> {/* Use route parameter :imageUrl */}
          </Routes>
        </div>
      </Router>
    </ChatContextProvider>
  );
};

export default App;

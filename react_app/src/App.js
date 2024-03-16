import React from 'react';
import { ChatContextProvider } from './context/chatContext';
import SideBar from './components/SideBar';
import MainChat from './components/MainChat';
import GestureMainChat from './components/GestureMainChat';
import DragGestureMainChat from './components/DragGestureMainChat';

import AnnotationCanvas from './components/AnnotationCanvas'; // Import AnnotationPage
import DragCanvas from './components/DragCanvas'; // Import AnnotationPage
import ResizeCanvas from './components/ResizeCanvas'; // Import AnnotationPage
import MainCanvas from './components/MainCanvas'; // Import AnnotationPage

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Routes and Route

const App = () => {
  localStorage.setItem('annotationDone', false);


  return (
    <ChatContextProvider>
      <Router>
        <div className='flex transition duration-500 ease-in-out'>
          <SideBar />
          <Routes>
            <Route path="/" element={<MainChat />} />
            <Route path="/text" element={<MainChat />} />
            {/* <Route path="/text_gesture" element={<GestureMainChat />} /> */}
            <Route path="/text_gesture" element={<DragGestureMainChat />} />

            {/* <Route path="/annotate/:imageUrl" element={<MainCanvas />} /> Use route parameter :imageUrl */}
            {/* <Route path="/annotate/:imageUrl" element={<ResizeCanvas />} /> Use route parameter :imageUrl */}

            {/* <Route path="/annotate/:imageUrl" element={<AnnotationCanvas />} /> Use route parameter :imageUrl */}
            <Route path="/annotate/:imageUrl" element={<DragCanvas />} /> Use route parameter :imageUrl

         </Routes>
        </div>
      </Router>
    </ChatContextProvider>
  );
};

export default App;

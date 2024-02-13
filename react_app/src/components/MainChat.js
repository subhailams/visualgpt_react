import React, { useState, useRef, useEffect, useContext } from 'react';
import Message from './Message';
import { ChatContext } from '../context/chatContext';
import Loading from './Loading';
import { MdSend } from 'react-icons/md';
// import { dalle } from '../utils/dalle';
import { OpenAIApi, Configuration } from 'openai';

/*
A chat view component that displays a list of messages and a form for sending new messages.
*/
const MainChat = () => {
  const messagesEndRef = useRef();
  const inputRef = useRef();
  const [formValue, setFormValue] = useState('');
  const [loading, setLoading] = useState(false);
  const options = ['VisualGPT'];
  const [selected, setSelected] = useState(options[0]);
  const [messages, addMessage] = useContext(ChatContext);
  const [annotationDone, setAnnotationDone] = useState(false);


  /*
  Scrolls the chat area to the bottom.
   */
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Adds a new message to the chat.
   *
   * @param {string} newValue - The text of the new message.
   * @param {boolean} [ai=false] - Whether the message was sent by an AI or the user.
   */
  
  const updateMessage = (content, ai = false, selected, isImage = false) => {
    const id = Date.now() + Math.floor(Math.random() * 1000000);
    const newMsg = {
      id: id,
      createdAt: Date.now(),
      content,
      ai: ai,
      selected: `${selected}`,
      isImage,
    };

    addMessage(newMsg);
  };


  const handleKeyDown = (e) => {
    // Check if the Enter key is pressed
    if (e.key === 'Enter' && !e.shiftKey) { // `e.shiftKey` check allows multi-line input if Shift+Enter is pressed
      e.preventDefault(); // Prevent the default action to avoid form submission/line break
      sendMessage(e);
    }
  };

  /**
   * Sends our prompt to our API and get response to our request from openai.
   *
   * @param {Event} e - The submit event of the form.
   */
  
  const sendMessage = async (e) => {
    e.preventDefault();
  
    const newMsg = formValue;
    const aiModel = selected;
  
    setLoading(true);
    setFormValue('');
    updateMessage(newMsg, false, aiModel);
  
    try {
      // Call your server endpoint
      const response = await fetch('http://localhost:3001/api/dalle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: formValue }) // Send the prompt as JSON
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Assuming the server response contains the imageUrl
      if (data && data.imageUrl) {
        localStorage.setItem('image_path', data.imageUrl);
        uploadImageToServer(data.imageUrl)
        updateMessage(data.imageUrl, true, aiModel, true); // Set isImage to true
        
      }
    } catch (err) {
      window.alert(`Error: ${err.message} please try again later`);
    }
  
    setLoading(false);
  };
  
  const uploadImageToServer = async (imageDataUrl) => {
    try {
        // Convert data URL to blob for file upload
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('image', blob, 'image.png'); // 'image' should match your server's expected field

        // Replace 'http://localhost:3001/upload' with your actual upload endpoint
        const uploadResponse = await fetch('http://localhost:3001/upload', {
            method: 'POST',
            body: formData,
        });
        
        if (uploadResponse.ok) {
            const data = await uploadResponse.json();
            if (data.imagePath) {
                console.log('Image saved on server:', data.imagePath);
                // Save the image path to local storage
                localStorage.setItem('image_path', data.imagePath);
                // Optionally, handle the success case, e.g., displaying a success message or navigating
            }
        } else {
            throw new Error('Upload failed: ' + uploadResponse.statusText);
        }
    } catch (error) {
        console.error('Upload failed:', error);
        // Handle upload error, e.g., displaying an error message
    }
};


  /**
   * Scrolls the chat area to the bottom when the messages array is updated.
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  /**
   * Focuses the TextArea input to when the component is first rendered.
   */
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const checkAndSendAnnotatedImage = async () => {
    try {
      // Fetch the annotated image from the server
      const response = await fetch('http://localhost:3001/uploads/image.png');
  
      // Check if the response is OK (status code 200)
      if (response.ok) {
        // If the image exists, update the message with the annotated image URL
        updateMessage('http://localhost:3001/uploads/image.png', true, selected, true); // Assuming `true` flags an image message
        updateMessage('What do you want to do with this image?', true, selected);
      }
    } catch (error) {
      // If an error occurs during the fetch request, log the error
      console.error('Error fetching annotated image:', error);
    }
  };


// useEffect to call checkAndSendAnnotatedImage when annotation is done
useEffect(() => {
  // Get the annotationDone value from local storage
  const annotationDone = JSON.parse(localStorage.getItem('annotationDone'));

  // Check if annotationDone is true
  if (annotationDone) {
      checkAndSendAnnotatedImage();
      localStorage.setItem('annotationDone', false);
  }

}, []);


  return (
    <div className='chatview'>
      <main className='chatview__chatarea'>
        {messages.map((message, index) => (
          <Message key={index} message={{ ...message }} />
        ))}

        {loading && <Loading />}

        <span ref={messagesEndRef}></span>
      </main>
      <form className='form' onSubmit={sendMessage}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className='dropdown'>
          <option>{options[0]}</option>
        </select>
        <div className='flex items-stretch justify-between w-full'>
          <textarea
            ref={inputRef}
            className='chatview__textarea-message'
            value={formValue}
            onKeyDown={handleKeyDown}
            onChange={(e) => setFormValue(e.target.value)}
          />
          <button
            type='submit'
            className='chatview__btn-send'
            disabled={!formValue}>
            <MdSend size={30} />
          </button>
        </div>
      </form>

    </div>
  );
};

export default MainChat;
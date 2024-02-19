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
  const defaultPrompt = 'Enter prompt to generate image';
  const [formValue, setFormValue] = useState(defaultPrompt);
  const [loading, setLoading] = useState(false);
  const options = ['VisualGPT'];
  const [selected, setSelected] = useState(options[0]);
  const [messages, addMessage] = useContext(ChatContext);
  const [isannotationDone, setAnnotationDone] = useState(false);
  const [predictions, setPredictions] = useState([]);
  
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /*
  Scrolls the chat area to the bottom.
   */
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    if (e.target.value === defaultPrompt) {
      setFormValue('');
      setIsFocused(true); // Set focused state to true
    }
  };

  const handleBlur = (e) => {
    if (!e.target.value) {
      setFormValue(defaultPrompt);
      setIsFocused(false); // Reset on blur if empty
    }
  };

  const handleChange = (e) => {
    setFormValue(e.target.value);
    if (!e.target.value) {
      setIsFocused(false);
    }
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


  async function urlToDataUrl(url) {
    const response = await fetch(url);
    const blob = await response.blob(); // Convert the response to a Blob
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = reject;
      fr.onload = () => resolve(fr.result);
      fr.readAsDataURL(blob); // Read the Blob as Data URL
    });
  }

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
    console.log()
    if (!isannotationDone) {
    try {
      console.log("Testing")
      await sleep(5000);
      uploadImageToServer("http://localhost:3001/uploads/demo.png", 'image.png')
      updateMessage("http://localhost:3001/uploads/demo.png", true, aiModel, true);
     
      // // Call your server endpoint
      // const response = await fetch('http://localhost:3001/predictions', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ prompt: formValue }) // Send the prompt as JSON
      // });
  
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
  
      // let img_prediction = await response.json();

      // while (
      //   img_prediction.status !== "succeeded" &&
      //   img_prediction.status !== "failed"
      // ) {
      //   await sleep(1000);
        
      //     // Use the id to call the predictions status endpoint
      //     const response = await fetch(`http://localhost:3001/predictions/${img_prediction.id}`, {
      //       headers: {
      //         'Content-Type': 'application/json',
      //         Authorization: process.env.REPLICATE_API_TOKEN // Ensure you're using the correct auth method
      //       }
      //     });

        
      //   console.log("___________________")
      //   console.log(response)
      //   console.log("___________________")
      //   img_prediction = await response.json();
         
        
      // }
      // if (img_prediction.status == 'succeeded') {
      //   uploadImageToServer(img_prediction.output, 'image.png')
      //   updateMessage(img_prediction.output, true, aiModel, true);
      //   setLoading(false);

      // }
    } catch (err) {
      window.alert(`Error: ${err.message} please try again later`);
    }
  
    setLoading(false);
  }
  if (isannotationDone) {

    try {
      const prompt = formValue;
      const originalImageUrl = localStorage.getItem('image.png');
      const maskImageUrl = localStorage.getItem('mask.png');
      
      const originalImage = await urlToDataUrl(originalImageUrl)
      const maskImage = await urlToDataUrl(maskImageUrl)

      // Construct the request body
      const requestBody = JSON.stringify({
        prompt: prompt,
        init_image: originalImage,
        mask: maskImage,
      });

      // Call the predictions API
      const predictionsResponse = await fetch('http://localhost:3001/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: requestBody
      });

      if (!predictionsResponse.ok) {
        throw new Error(`HTTP error! status: ${predictionsResponse.status}`);
      }

      let prediction = await predictionsResponse.json();

      // Handle the predictions response, e.g., displaying the result
      console.log(prediction);
      
      setPredictions(predictions.concat([prediction]));
      

      while (
        prediction.status !== "succeeded" &&
        prediction.status !== "failed"
      ) {
        await sleep(1000);
        
          // Use the id to call the predictions status endpoint
          const response = await fetch(`http://localhost:3001/predictions/${prediction.id}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: process.env.REPLICATE_API_TOKEN // Ensure you're using the correct auth method
            }
          });

        
        console.log("___________________")
        console.log(response)
        console.log("___________________")
        prediction = await response.json();
       
        setPredictions(predictions.concat([prediction]));
  
        
      }
      if (prediction.status == 'succeeded') {
        uploadImageToServer(prediction.output, 'prediction.png')
        updateMessage(prediction.output, true, aiModel, true);
        setLoading(false);

      }
      // Code here to call predictions/id to pass the id from predictionsData.id
      

      
    } catch (err) {
      window.alert(`Error: ${err.message} please try again later`);
    }

  }

};
  
const uploadImageToServer = async (imageDataUrl, filename) => {
  // Convert data URL to blob for file upload
  const response = await fetch(imageDataUrl);
  const blob = await response.blob();
  const formData = new FormData();
  formData.append('image', blob, filename); // Use 'mask.png' or 'image.png' based on the argument

  const uploadEndpoint = 'http://localhost:3001/upload'; // Adjust if necessary
  try {
      const uploadResponse = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData,
      });
      
      if (!uploadResponse.ok) throw new Error('Upload failed: ' + uploadResponse.statusText);
      
      const data = await uploadResponse.json();
      console.log(`${filename} saved on server:`, data.imagePath);
      localStorage.setItem(filename, data.imagePath); // Save path as mask.png or image.png
  } catch (error) {
      console.error('Upload failed:', error);
  }
};

  /**
   * Scrolls the chat area to the bottom when the messages array is updated.
   */
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages, loading]);

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
        updateMessage('http://localhost:3001/uploads/image_sktech.png', true, selected, true); // Assuming `true` flags an image message
        updateMessage('What do you want to do with this image?',true, "filler", false);
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
      setAnnotationDone(true);
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
        {/* <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className='dropdown'>
          <option>{options[0]}</option>
        </select> */}
        <div className='flex items-stretch justify-between w-full'>
          <textarea
            ref={inputRef}
            className={`chatview__textarea-message ${formValue === defaultPrompt && !isFocused ? 'text-gray-500' : 'text-black'} ...otherClasses`}
            value={formValue}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
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
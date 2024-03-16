import React, { useState, useRef, useEffect, useContext } from 'react';
import Message from './GestureMessage';
import { ChatContext } from '../context/chatContext';
import Loading from './Loading';
import { MdSend } from 'react-icons/md';
// import { dalle } from '../utils/dalle';
import { OpenAIApi, Configuration } from 'openai';

/*
A chat view component that displays a list of messages and a form for sending new messages.
*/
const DragGestureMainChat = () => {
  const messagesEndRef = useRef();
  const inputRef = useRef();
  const defaultPrompt = 'Enter prompt to generate image';
  const [formValue, setFormValue] = useState(defaultPrompt);
  const [loading, setLoading] = useState(false);
  const options = ['VisualGPT'];
  const [selected, setSelected] = useState(options[0]);
  const [messages, addMessage] = useContext(ChatContext);
  const [isannotationDone, setAnnotationDone] = useState(false);
  const [isresizeDone, setresizeDone] = useState(false);

  const [predictions, setPredictions] = useState([]);
  const [isgenerationDone, setGenerationDone] = useState(false);

  
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
    console.log(isannotationDone)

    
    if (!isannotationDone) {
      // const generationDone = JSON.parse(localStorage.getItem('generationDone'));
 
    // try {
    //   setLoading(true);
    //   console.log("Generating....")

    //   setGenerationDone(true);
    //   setLoading(false);
    //   const originalImageUrl = localStorage.getItem('image.png');
    //   updateMessage(originalImageUrl, true, aiModel, true);

    // } catch (err) {
    //   window.alert(`Error: ${err.message} please try again later`);
    // }
    // setLoading(false);

    if (isgenerationDone){
      console.log("Instructing....")

      const originalImageUrl = localStorage.getItem('image.png');

      // Code to call the instruct api to get image url
        try {
          // Construct the request to the Express server which will forward it to Django
          const instructResponse = await fetch('http://localhost:3001/instruct', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              image_url: originalImageUrl, // Ensure this is the correct URL or path to the image
              prompt: formValue, // The user's input that will be used for processing
            })
          });

          if (!instructResponse.ok) {
            throw new Error(`HTTP error! Status: ${instructResponse.status}`);
          }

          const instructData = await instructResponse.json();
          console.log(instructData)
          // Assuming instructData contains the URL to the processed image
          if (instructData) {
            // Update the chat with the new image
            console.log(instructData.image_url)
            // uploadImageToServer(instructData.image_url, 'image.png')
            localStorage.setItem('image.png', instructData.image_url);
            updateMessage(instructData.image_url, true, aiModel, true); // Update with the image path
            setLoading(false);
          }
        } catch (error) {
          console.error('Error calling instruct API:', error);
          setLoading(false);
          // Handle the error, maybe show a message to the user
        }

    }
  else{
        try {

          setLoading(true);
          console.log("Generating....")

          setGenerationDone(true);
          setLoading(false);
          const originalImageUrl = localStorage.getItem('image.png');
          updateMessage(originalImageUrl, true, aiModel, true);


        } catch (err) {
          window.alert(`Error: ${err.message} please try again later`);
        }
        setLoading(false);
      }
  }

    
  // if (isannotationDone) {
  
  //   console.log("Moving....")

  //   const originalImageUrl = localStorage.getItem('image.png');
    
  //   const maskurl = localStorage.getItem('mask.png');
  //   const selected_points = localStorage.getItem('selected_points')

  //   console.log(originalImageUrl)
  //   console.log(maskurl)
  //   console.log(selected_points)

  //   // Code to call the instruct api to get image url
  //     try {
  //       // Construct the request to the Express server which will forward it to Django
  //       const dragResponse = await fetch('http://localhost:3001/move', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json'
  //         },
  //         body: JSON.stringify({
  //           image_url: originalImageUrl, // Ensure this is the correct URL or path to the image
  //           mask_url: maskurl,
  //           selected_points: selected_points, // The user's input that will be used for processing
  //         })
  //       });

  //       if (!dragResponse.ok) {
  //         throw new Error(`HTTP error! Status: ${dragResponse.status}`);
  //       }

  //       const inpaintData = await dragResponse.json();
  //       console.log("drag response: ",inpaintData)
  //       // Assuming inpaintData contains the URL to the processed image
  //       if (inpaintData) {
  //         // Update the chat with the new image
  //         console.log(inpaintData.image_url)
  //         // uploadImageToServer(inpaintData.image_url, 'image_new.png')
  //         localStorage.setItem('image.png', inpaintData.image_url);
  //         await sleep(100)
  //         updateMessage(inpaintData.image_url, true, aiModel, true); // Update with the image path
  //         setLoading(false);
  //       }
  //     } catch (error) {
  //       console.error('Error calling inpaint API:', error);
  //       setLoading(false);
  //       // Handle the error, maybe show a message to the user
  //     }
    
  // }

};
  
const uploadImageToServer = async (imageDataUrl, filename) => {
  // Convert data URL to blob for file upload
  const response = await fetch(imageDataUrl, {mode: 'no-cors'});
  const blob = await response.blob();
  const formData = new FormData();
  formData.append('image', blob, filename); // Use 'mask.png' or 'image.png' based on the argument

  const uploadEndpoint = 'http://localhost:3001/upload'; // Adjust if necessary
  try {
      const uploadResponse = await fetch(uploadEndpoint, {
          method: 'POST',
          mode: 'cors',
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
    const resizeDone = JSON.parse(localStorage.getItem('resizeDone'));
    console.log("Resize",isresizeDone)

    if(resizeDone){

       setLoading(true);
       updateMessage('Resizing in progress..',true, "filler", false);
        console.log("Resizing....")
  
        const originalImageUrl = localStorage.getItem('image.png');
        
        const maskurl = localStorage.getItem('mask.png');
        const resize_scale = JSON.parse(localStorage.getItem('resize_scale'))
    
        console.log(originalImageUrl)
        console.log(maskurl)
        console.log(resize_scale)
    
        // Code to call the instruct api to get image url
          try {
            // Construct the request to the Express server which will forward it to Django
            const dragResponse = await fetch('http://localhost:3001/resize', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                image_url: originalImageUrl, // Ensure this is the correct URL or path to the image
                mask_url: maskurl,
                resize_scale: resize_scale, // The user's input that will be used for processing
              })
            });
    
            if (!dragResponse.ok) {
              throw new Error(`HTTP error! Status: ${dragResponse.status}`);
            }
    
            const inpaintData = await dragResponse.json();
            console.log("drag response: ",inpaintData)
            // Assuming inpaintData contains the URL to the processed image
            if (inpaintData) {
              // Update the chat with the new image
              console.log(inpaintData.image_url)
              // uploadImageToServer(inpaintData.image_url, 'image_new.png')
              localStorage.setItem('image.png', inpaintData.image_url);
              await sleep(100)
              updateMessage(inpaintData.image_url, true, selected, true); // Update with the image path
              setLoading(false);
            }
          } catch (error) {
            console.error('Error calling inpaint API:', error);
            setLoading(false);
            // Handle the error, maybe show a message to the user
          }
  
    
    }
    else{
    const originalImageUrl = localStorage.getItem('image.png');
    
    const maskurl = localStorage.getItem('mask.png');

    const selected_points = localStorage.getItem('selected_points')
    console.log(originalImageUrl)
    console.log(maskurl)
    console.log(selected_points)
    setLoading(false);
    updateMessage('http://localhost:3001/uploads/image_with_arrow.png', true, selected, true);
    updateMessage('You have made above move. Moving the object...', true, selected, false )

    const originalImageUrl1 = localStorage.getItem('image.png');
    
    const maskurl1 = localStorage.getItem('mask.png');

    const selected_points1 = localStorage.getItem('selected_points')
    console.log(originalImageUrl)
    console.log(maskurl)
    console.log(selected_points)

    setLoading(true)
    try {
      // Construct the request to the Express server which will forward it to Django
      const dragResponse = await fetch('http://localhost:3001/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: originalImageUrl1, // Ensure this is the correct URL or path to the image
          mask_url: maskurl1,
          selected_points: selected_points1, // The user's input that will be used for processing
        })
      });

      if (!dragResponse.ok) {
        throw new Error(`HTTP error! Status: ${dragResponse.status}`);
      }

      const inpaintData = await dragResponse.json();
      console.log("drag response: ",inpaintData)
      // Assuming inpaintData contains the URL to the processed image
      if (inpaintData) {
        // Update the chat with the new image
        console.log(inpaintData.image_url)
        // uploadImageToServer(inpaintData.image_url, 'image_new.png')
        localStorage.setItem('image.png', inpaintData.image_url);
        await sleep(100)
        updateMessage(inpaintData.image_url, true, selected, true); // Update with the image path
        setLoading(false);
      }
    } catch (error) {
      console.error('Error calling move API:', error);
      setLoading(false);
      // Handle the error, maybe show a message to the user
    }
  }
  };


// useEffect to call checkAndSendAnnotatedImage when annotation is done
useEffect(() => {
  // Get the annotationDone value from local storage
  const annotationDone = JSON.parse(localStorage.getItem('annotationDone'));
  const resizeDone = JSON.parse(localStorage.getItem('resizeDone'));
  // console.log("Resize first", resizeDone)
  // if (resizeDone) {
  //   checkAndSendAnnotatedImage();
  //   setresizeDone(true);
  //   localStorage.setItem('resizeDone', false);
  // }
  

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

export default DragGestureMainChat;
import React, { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { useNavigate } from "react-router-dom";

const AnnotationCanvas = ({ onDraw }) => {
  const canvasRef = useRef(null);
  const [fetchedImage, setFetchedImage] = useState('');
  const navigate = useNavigate();
  const [canvasSize, setCanvasSize] = useState({ width: 512, height: 512 }); // Default size or dynamically set

  useEffect(() => {
    const originalImageUrl = localStorage.getItem('image_path');
    if (originalImageUrl) {
      const proxyUrl = `http://localhost:3001/fetch-image?url=${encodeURIComponent(originalImageUrl)}`;
      fetch(proxyUrl)
        .then(response => response.blob())
        .then(blob => {
          const localUrl = URL.createObjectURL(blob);
          setFetchedImage(localUrl);
        })
        .catch(e => console.error('Error fetching the image through proxy: ', e));
    } else {
      console.error('No original image found in local storage');
    }
  }, []);

  const saveAnnotatedImage = async () => {
    if (!canvasRef.current) {
        console.error('Canvas reference is not available');
        return;
    }

    if (!fetchedImage) {
        console.error('Fetched image is not available');
        return;
    }

    // Load the background image
    const backgroundImg = new Image();
    backgroundImg.src = fetchedImage;

    backgroundImg.onload = async () => {
        // Use the natural dimensions of the fetched image or scale it
        // let width = backgroundImg.naturalWidth;
        // let height = backgroundImg.naturalHeight;
        let width = 512;
        let height = 512;

        // Export the ReactSketchCanvas drawing as an image
        const sketchDataUrl = await canvasRef.current.exportImage('image/png');

        // Create an off-screen canvas with dimensions matching the scaled image
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        const ctx = offscreenCanvas.getContext('2d');

        // Draw the background image first
        ctx.drawImage(backgroundImg, 0, 0, width, height);

        // Then overlay the sketch image
        const sketchImg = new Image();
        sketchImg.src = sketchDataUrl;
        sketchImg.onload = () => {
            ctx.drawImage(sketchImg, 0, 0, width, height);

            // Now offscreenCanvas contains the combined image
            const combinedDataUrl = offscreenCanvas.toDataURL('image/png');

            // Upload the combined image to the server
            uploadImageToServer(combinedDataUrl, 'image_sktech.png');
            localStorage.setItem('annotationDone', true);
        };

        const offscreenCanvas1 = document.createElement('canvas');
        offscreenCanvas1.width = width;
        offscreenCanvas1.height = height;
        const ctx1 = offscreenCanvas1.getContext('2d');

        // Fill the canvas with white background
        ctx1.fillStyle = '#FFFFFF'; // Set fill color to white
        ctx1.fillRect(0, 0, width, height); // Fill the canvas area with white

        // Then overlay the sketch image
        const sketchImg1 = new Image();
        sketchImg1.src = sketchDataUrl;
        sketchImg1.onload = () => {
            ctx1.drawImage(sketchImg1, 0, 0, width, height);
            // Now offscreenCanvas contains the sketch over a white background
            const combinedDataUrl1 = offscreenCanvas1.toDataURL('image/png');
            // Proceed with uploading the combined image as before
            uploadImageToServer(combinedDataUrl1, 'mask.png');
        };
    };
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

  const goBackToChat = () => {
    navigate('/');
  };

  // const backgroundStyle = {
  //   backgroundImage: `url(${fetchedImage})`,
  //   backgroundSize: 'cover',
  //   backgroundPosition: 'center',
  //   width: '90%',
  //   height: '80%',
  //   position: 'relative',
  //   top: 0,
  //   left: 0,
  //   zIndex: 0
  // };

  return (
  <div style={{ width: '90%', alignItems: 'center', marginTop: '20px', marginLeft: '20px'}}>
    <div style={{ position: 'relative',justifyContent: 'center', width: '80%', height: '80%' }}>
      {/* Display image directly */}
      <img src={fetchedImage} alt="Fetched" style={{ width: '90%', height: '90%', position: 'absolute', top: 0, left: '5%', zIndex: 0 }} />

      {/* ReactSketchCanvas as overlay */}
      <ReactSketchCanvas
        ref={canvasRef}
        strokeWidth={100} // Adjusted for finer lines
        strokeColor="black"
        canvasColor="transparent"
        onChange={onDraw}
        style={{ position: 'absolute', top: 0, left: '5%', width: '90%', height: '90%' }}
      />
    </div>
        
      {/* Buttons displayed below the canvas */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '80%' }}>
        <button onClick={saveAnnotatedImage} style={buttonStyle}>
          Save Image
        </button>
        
        <button onClick={goBackToChat} style={{ ...buttonStyle, marginLeft: '10px' }}>
          Go Back to Chat
        </button>
      </div>
    </div>
  );
};

const buttonStyle = {
  marginTop: '2px',
  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px'
};

export default AnnotationCanvas;

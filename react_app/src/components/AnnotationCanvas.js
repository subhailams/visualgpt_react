import React, { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { useNavigate } from "react-router-dom";

const AnnotationCanvas = ({ onDraw }) => {
  const canvasRef = useRef(null);
  const [fetchedImage, setFetchedImage] = useState('');
  const navigate = useNavigate();
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 }); // Default size or dynamically set

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
        let width = backgroundImg.naturalWidth;
        let height = backgroundImg.naturalHeight;

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
            uploadImageToServer(combinedDataUrl);
            localStorage.setItem('annotationDone', true);
        };
    };
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


  const goBackToChat = () => {
    navigate('/');
  };

  const backgroundStyle = {
    backgroundImage: `url(${fetchedImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '90%',
    height: '80%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0
  };

  return (
    <div style={{ width: '90%',  alignItems: 'center', marginTop: '20px', marginBottom: '5px' }}>
      <div style={{ position: 'relative', width: '90%', height: '80%' }}>
        {/* Background image */}
        <div style={backgroundStyle}></div>
        
        {/* ReactSketchCanvas as overlay */}
        <ReactSketchCanvas
          ref={canvasRef}
          strokeWidth={100} // Adjusted for finer lines
          strokeColor="black"
          canvasColor="transparent"
          onChange={onDraw}
          style={{ position: 'relative', width: '90%', height: '80%' }}
        />
      </div>
      
      {/* Buttons displayed below the canvas */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '80%', marginTop: '5px' }}>
        <button onClick={saveAnnotatedImage} style={buttonStyle}>
          Save Annotated Image
        </button>
        
        <button onClick={goBackToChat} style={{ ...buttonStyle, marginLeft: '10px' }}>
          Go Back to Chat
        </button>
      </div>
    </div>
  );
};

const buttonStyle = {
  marginTop: '10px',
  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px'
};

export default AnnotationCanvas;

import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useDrag } from '@use-gesture/react';

const DragCanvas = () => {
  const navigate = useNavigate();
  const [dragStartCoordinates, setDragStartCoordinates] = useState({ x: 0, y: 0 });
  const [dragEndCoordinates, setDragEndCoordinates] = useState({ x: 0, y: 0 });
  const [currentDragCoordinates, setCurrentDragCoordinates] = useState({ x: 0, y: 0 });
  const [fetchedImage, setFetchedImage] = useState('');
  const imageRef = useRef();

  useEffect(() => {
    const originalImageUrl = localStorage.getItem('image.png');
    console.log(originalImageUrl);
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

  const actualWidth = 600;
  const actualHeight = 400;
  
  const adjustCoordinates = (coordinates) => {
    const adjustedX = (coordinates.x / (imageRef.current?.clientWidth ?? 1)) * actualWidth;
    const adjustedY = (coordinates.y / (imageRef.current?.clientHeight ?? 1)) * actualHeight;
    return { x: adjustedX, y: adjustedY };
  };
  
  const bind = useDrag((state) => {
    const { down, initial, xy, last } = state;
    const imageRect = imageRef.current?.getBoundingClientRect();
  
    if (down) {
      const startX = initial[0] - imageRect.left;
      const startY = initial[1] - imageRect.top;
      const startCoords = adjustCoordinates({ x: startX, y: startY });
      setDragStartCoordinates(startCoords);
      setCurrentDragCoordinates(startCoords);  // Initialize currentDragCoordinates
    } 

    // Update current drag position
    const currentX = xy[0] - imageRect.left;
    const currentY = xy[1] - imageRect.top;
    const currentCoords = adjustCoordinates({ x: currentX, y: currentY });
    setCurrentDragCoordinates(currentCoords);
  
    if (last) {
      const endX = currentX;
      const endY = currentY;
      const endCoords = adjustCoordinates({ x: endX, y: endY });
      setDragEndCoordinates(endCoords);
    }
  });
  
  useEffect(() => {
    console.log(`Drag started at (${dragStartCoordinates.x}, ${dragStartCoordinates.y}) and ended at (${dragEndCoordinates.x}, ${dragEndCoordinates.y})`);
    const selectedPointsString = `${dragStartCoordinates.x} ${dragStartCoordinates.y} ${dragEndCoordinates.x} ${dragEndCoordinates.y}`;
    localStorage.setItem('selected_points', selectedPointsString);
    localStorage.setItem('annotationDone', true);
  }, [dragEndCoordinates]);


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

  
  const handleSave = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = imageRef.current.clientWidth;
    canvas.height = imageRef.current.clientHeight;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    // Draw the image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
  
    // Draw the arrow if it exists
    if (dragStartCoordinates.x !== dragEndCoordinates.x || dragStartCoordinates.y !== dragEndCoordinates.y) {
      // Re-create the arrow on the canvas
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(dragStartCoordinates.x, dragStartCoordinates.y);
      ctx.lineTo(dragEndCoordinates.x, dragEndCoordinates.y);
      ctx.stroke();
  
      // Arrowhead (could be more precise with actual triangle like in SVG)
      ctx.setLineDash([]); // Reset to solid line for arrowhead
      ctx.beginPath();
      ctx.moveTo(dragEndCoordinates.x, dragEndCoordinates.y);
      ctx.lineTo(dragEndCoordinates.x - 10, dragEndCoordinates.y - 10);
      ctx.lineTo(dragEndCoordinates.x - 10, dragEndCoordinates.y + 10);
      ctx.closePath();
      ctx.fill();
    }
  
    // Convert canvas to data URL and upload
    const dataUrl = canvas.toDataURL('image/png');
    await uploadImageToServer(dataUrl, 'image_with_arrow.png');
  };
  
  const goBackToChat = () => {
    navigate('/text_gesture');
  };

  const onImageLoad = () => {
    console.log('Image loaded with dimensions:', imageRef.current?.clientWidth, imageRef.current?.clientHeight);
  };

  const imageContainerStyle = {
    cursor: 'pointer',
    position: 'relative',
    width: '100%', // Container takes the full width of its parent
    height: 'auto', // Height adjusts to maintain aspect ratio
    marginTop: '20px',
    marginLeft: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
  
  const imageStyle = {
    maxWidth: '100%', // Image can grow to the width of its container
    maxHeight: '100%', // Image can grow to the height of its container
    pointerEvents: 'none',
    userSelect: 'none',
    outline: 'none',
  };
  
  // Function to draw a line for visual feedback during drag
// Function to draw a dashed line for visual feedback during drag
// Function to draw an arrow for visual feedback during drag
// Function to draw a dashed line arrow for visual feedback during drag
const renderDragLine = () => {
  if (dragStartCoordinates.x !== currentDragCoordinates.x || dragStartCoordinates.y !== currentDragCoordinates.y) {
    // Calculate the angle for the arrowhead
    const angle = Math.atan2(currentDragCoordinates.y - dragStartCoordinates.y, currentDragCoordinates.x - dragStartCoordinates.x) * 180 / Math.PI;
    
    return (
      <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} width="100%" height="100%">
        {/* Dashed line part of the arrow */}
        <line x1={dragStartCoordinates.x} y1={dragStartCoordinates.y} x2={currentDragCoordinates.x} y2={currentDragCoordinates.y} 
              stroke="white" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Solid arrowhead part of the arrow */}
        <polygon 
          points={`${currentDragCoordinates.x},${currentDragCoordinates.y} ${currentDragCoordinates.x - 15},${currentDragCoordinates.y - 5} ${currentDragCoordinates.x - 15},${currentDragCoordinates.y + 5}`}
          fill="white"
          transform={`rotate(${angle} ${currentDragCoordinates.x} ${currentDragCoordinates.y})`}
        />
      </svg>
    );
  }
  return null;
};




  return (
    <div style={{ alignItems: 'center', marginTop: '20px', marginLeft: '20px'}}>
      <h1 style={{ textAlign: 'center', marginBottom: '1px' }}>Drag the object you like to move</h1>
      <div {...bind()} style={imageContainerStyle}>
        <img
          ref={imageRef}
          src={fetchedImage}
          onLoad={onImageLoad}
          alt="Draggable"
          style={imageStyle}
        />
        {renderDragLine()}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center',  marginTop: '15px' }}>
      <button onClick={handleSave} style={{ ...buttonStyle, marginLeft: '10px' }}>
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
  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px'
};

export default DragCanvas;

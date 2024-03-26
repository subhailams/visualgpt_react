import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useDrag } from '@use-gesture/react';

const DragCanvas = () => {
  const navigate = useNavigate();
  const [dragStartCoordinates, setDragStartCoordinates] = useState({ x: 0, y: 0 });
  const [dragEndCoordinates, setDragEndCoordinates] = useState({ x: 0, y: 0 });
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
      // console.log(`Start X: Raw (${initial[0]}) Adjusted (${startX})`); // Debug start x-coordinate
      const startY = initial[1] - imageRect.top;
      const startCoords = adjustCoordinates({ x: startX, y: startY });
      setDragStartCoordinates(startCoords);
    } 
  
    if (last) {
      // Calculate end coordinates when the drag ends (last is true)
      const endX = xy[0] - imageRect.left;
      const endY = xy[1] - imageRect.top;
      const endCoords = adjustCoordinates({ x: endX, y: endY });
      setDragEndCoordinates(endCoords);
    }
  });
  
  useEffect(() => {
    console.log(`Drag started at (${dragStartCoordinates.x}, ${dragStartCoordinates.y}) and ended at (${dragEndCoordinates.x}, ${dragEndCoordinates.y})`);
    const selectedPointsString = `${dragStartCoordinates.x} ${dragStartCoordinates.y} ${dragEndCoordinates.x} ${dragEndCoordinates.y}`;
    localStorage.setItem('selected_points', selectedPointsString);
    localStorage.setItem('annotationDone', true);
  }, [dragEndCoordinates]); // This useEffect will trigger whenever dragEndCoordinates change.
  
  const goBackToChat = () => {
    localStorage.setItem('annotationDone', true);
    // localStorage.setItem('generationDone', false);

    navigate('/text_gesture');
  };

  const onImageLoad = () => {
    console.log('Image loaded with dimensions:', imageRef.current?.clientWidth, imageRef.current?.clientHeight);
  };

  return (
    <div style={{ alignItems: 'center',maxWidth: '100%',maxHeight: '100%', marginTop: '20px', marginLeft: '20px'}}>
      <h1 style={{ textAlign: 'center', marginBottom: '1px' }}>Drag the object you like to move</h1>
      <div {...bind()} style={{
            display: 'inline-block',
            cursor: 'pointer',
            position: 'relative',
            justifyContent: 'center',
            userSelect: 'none', 
            outline: 'none',
            maxHeight: '100%',
            maxHeight: '100%'
          }}>
        
        <img
          ref={imageRef}
          src={fetchedImage}
          onLoad={onImageLoad}
          alt="Draggable"
          style={{
            maxWidth: '100%', // Prevents the image from exceeding the width of its container
            maxHeight: '100%', // Optional: you can set a maxHeight if you want to limit how tall the image can be
            pointerEvents: 'none',
            userSelect: 'none',
            outline: 'none'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
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

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';

const ResizeCanvas = () => {
  const navigate = useNavigate();
  const [canvas, setCanvas] = useState(null);
  const [resizeFactor, setResizeFactor] = useState(1); // Default zoom factor
  const [points, setPoints] = useState(null); // To store the points

  useEffect(() => {
    // Initialize the Fabric.js canvas
    const fabricCanvas = new fabric.Canvas('fabric-canvas', {
      width: 600,
      height: 400,
      selection: false,
    });
    setCanvas(fabricCanvas);

    // Initialize and add two points on the canvas, positioned diagonally
    const point1 = new fabric.Circle({
      radius: 5,
      fill: 'white',
      left: 300 - 50, // Starting X position for point1
      top: 200 + 50,  // Starting Y position for point1
      selectable: false,
    });

    const point2 = new fabric.Circle({
      radius: 5,
      fill: 'white',
      left: 300 + 50, // Starting X position for point2
      top: 200 - 50,  // Starting Y position for point2
      selectable: false,
    });

    fabricCanvas.add(point1, point2);
    setPoints([point1, point2]);

    return () => fabricCanvas.dispose(); // Cleanup
  }, []);

  useEffect(() => {
    // Adjust the positions of the points based on the resize factor, diagonally
    if (canvas && points) {
      const [point1, point2] = points;
      const baseDistance = 50; // Base distance between points
      const newDistance = baseDistance * resizeFactor;

      point1.set({ left: 300 - newDistance, top: 200 + newDistance });
      point2.set({ left: 300 + newDistance, top: 200 - newDistance });

      canvas.renderAll();
    }
  }, [resizeFactor, canvas, points]);

  useEffect(() => {
    const originalImageUrl = localStorage.getItem('image.png');
    if (originalImageUrl && canvas) {
      const proxyUrl = `http://localhost:3001/fetch-image?url=${encodeURIComponent(originalImageUrl)}`;
      fetch(proxyUrl)
        .then(response => response.blob())
        .then(blob => {
          const localUrl = URL.createObjectURL(blob);
          canvas.setBackgroundImage(localUrl, canvas.renderAll.bind(canvas), {
            originX: 'left',
            originY: 'top',
            scaleX: canvas.width / canvas.getWidth(),
            scaleY: canvas.height / canvas.getHeight(),
          });
        })
        .catch(e => console.error('Error fetching the image through proxy: ', e));
    }
  }, [canvas]);

  // Only re-run the effect if 'canvas' changes
  useEffect(() => {
    // Adjust the positions of the points based on the resize factor
    if (canvas && points) {
      const [point1, point2] = points;
      const midX = canvas.width / 2;
      const spacing = 300 * resizeFactor; // Change 300 to your desired base spacing

      point1.set({ left: midX - (spacing / 2) });
      point2.set({ left: midX + (spacing / 2) });

      canvas.renderAll();
    }
  }, [resizeFactor, canvas, points]);

  useEffect(() => {
    if (canvas) {
      // Handler for capturing zoom factor from mouse wheel event
      const handleWheel = (event) => {
        // Prevent the canvas from zooming
        event.preventDefault();
        event.stopPropagation();
  
        // Calculate the zoom factor
        var delta = event.deltaY;
        var scaleFactor = Math.pow(0.999, delta);
        var newResizeFactor = resizeFactor * scaleFactor;
  
        // Clamp the new zoom factor to the range [0, 1.5]
        newResizeFactor = Math.max(0, Math.min(newResizeFactor, 1.5));
  
        // Update the resize factor state without zooming the canvas
        setResizeFactor(newResizeFactor);
      };
  
      // Add the wheel event listener
      const canvasWrapper = canvas.wrapperEl;
      canvasWrapper.addEventListener('wheel', handleWheel);
  
      // Clean up the event listener when the component is unmounted or the canvas is changed
      return () => {
        canvasWrapper.removeEventListener('wheel', handleWheel);
      };
    }
  }, [canvas, resizeFactor]); // Rerun the effect if 'canvas' or 'zoomFactor' changes
  
  const saveAnnotatedImage = async () => {
    if (canvas) {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
      });

      // Instead of downloading the image, upload it
      uploadImageToServer(dataUrl, 'resize_image.png');
    }
    localStorage.setItem('resize_scale', resizeFactor.toString());
    localStorage.setItem('resizeDone', true)
    localStorage.setItem('action', 'resize');
  };

  const uploadImageToServer = async (imageDataUrl, filename) => {
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('image', blob, filename);

    const uploadEndpoint = 'http://localhost:3001/upload';
    try {
      const uploadResponse = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) throw new Error('Upload failed: ' + uploadResponse.statusText);
      
      const data = await uploadResponse.json();
      console.log(`${filename} saved on server:`, data.imagePath);
      localStorage.setItem(filename, data.imagePath);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };



  const goBackToChat = () => {
    localStorage.setItem('annotationDone', true);
     // Store the zoom factor
    navigate('/text_gesture');
  };

  return (
    <div style={{ width: '600px', height: '400px', position: 'relative' }}>
      <h1 style={{ marginBottom: '1px' }}>Pinch/Spread to resize the image</h1>
      <canvas id="fabric-canvas" style={{ width: '100%', height: '100%' }} />
      
      <div style={{ position: 'absolute', top: 20, right: 150 }}>
        Resize Value: {resizeFactor.toFixed(2)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>

      <button onClick={saveAnnotatedImage} style={buttonStyle}>
          Save Gesture Input
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

export default ResizeCanvas;

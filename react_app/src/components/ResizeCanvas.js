import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';

const ResizeCanvas = () => {
  const navigate = useNavigate();
  const [canvas, setCanvas] = useState(null);
  const [resizeFactor, setResizeFactor] = useState(1); // Default zoom factor

  useEffect(() => {
    // Initialize the Fabric.js canvas
    const fabricCanvas = new fabric.Canvas('fabric-canvas', {
      width: 600,
      height: 400,
      selection: false,
    });
    setCanvas(fabricCanvas);

    return () => fabricCanvas.dispose(); // Cleanup
  }, []);

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
    localStorage.setItem('resize_scale', resizeFactor.toString());
    localStorage.setItem('resizeDone', true)
  };

  const goBackToChat = () => {
     // Store the zoom factor
    navigate('/text_gesture');
  };

  return (
    <div style={{ width: '600px', height: '400px', position: 'relative' }}>
      <canvas id="fabric-canvas" style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: 10, right: 150 }}>
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

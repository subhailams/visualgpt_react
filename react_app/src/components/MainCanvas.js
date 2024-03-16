import React, { useState } from 'react';
import AnnotationCanvas from './AnnotationCanvas';
import DragCanvas from './DragCanvas';
import ResizeCanvas from './ResizeCanvas';

const sharedCanvasStyle = {
//   width: '90%',
  alignItems: 'center',
  position: 'relative',
//   marginTop: '20px',
  marginLeft: '80px',
};

const sharedButtonStyle = {
  marginTop: '40px',
  marginLeft: '60px',

  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  margin: '10px',
};

const MainCanvas = () => {
  const [canvasType, setCanvasType] = useState('Annotation');

  return (
    <div style={sharedCanvasStyle}>
      
        <button onClick={() => setCanvasType('Annotation')} style={sharedButtonStyle}>Selection</button>
        <button onClick={() => setCanvasType('Drag')} style={sharedButtonStyle}>Move Object</button>
        <button onClick={() => setCanvasType('Resize')} style={sharedButtonStyle}>Resize Object</button>
      {canvasType === 'Annotation' && <AnnotationCanvas />}
      {canvasType === 'Drag' && <DragCanvas />}
      {canvasType === 'Resize' && <ResizeCanvas />}
    </div>
  );
};

export default MainCanvas;

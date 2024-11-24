import { useState } from 'react';
import React from "react";

function Landmark() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(!clicked);
    console.log("Button clicked!", clicked);
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}> 
      {/* Button Overlayed on top of the Canvas */}
      <button
        onClick={handleClick}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        {clicked ? 'Clicked!' : 'Click me'}
      </button>
    </div>
  );
}

export default Landmark;

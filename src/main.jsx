import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import App from './App.jsx';

const Root = () => {
  useEffect(() => {
    // Apply styles directly to the body and #root after the component mounts
    document.body.style.width = "100vw";
    document.body.style.height = "100vh";
    document.getElementById("root").style.width = "100%";
    document.getElementById("root").style.height = "100%";

    return () => {
      // Clean up styles on unmount
      document.body.style.width = '';
      document.body.style.height = '';
      document.getElementById("root").style.width = '';
      document.getElementById("root").style.height = '';
    };
  }, []);

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        // Mantine theme customization goes here
      }}
    >
      <App />
    </MantineProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

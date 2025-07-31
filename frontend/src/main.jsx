import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TokenContextProvider from './contexts/TokenContextProvider.jsx';
import UserContextProvider from './contexts/UserContextProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TokenContextProvider>
      <UserContextProvider>
        <App />
      </UserContextProvider>
    </TokenContextProvider>
  </StrictMode>,
)

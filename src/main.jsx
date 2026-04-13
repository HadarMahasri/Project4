import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
         <div style={{ color: 'red', padding: '20px', background: 'white', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
            <h2>Something went wrong.</h2>
            <pre>{this.state.error && this.state.error.toString()}</pre>
            <pre style={{ fontSize: '10px' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
         </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

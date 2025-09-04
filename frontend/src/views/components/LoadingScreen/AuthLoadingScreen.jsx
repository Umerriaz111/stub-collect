import React from 'react';

const AuthLoadingScreen = () => {
  return (
    <div className="auth-loading-screen">
      <div className="auth-loading-container">
        <div className="auth-loading-spinner">
          <div className="spinner"></div>
        </div>
        <div className="auth-loading-text">
          <h3>Checking Authentication...</h3>
          <p>Please wait while we verify your login status</p>
        </div>
      </div>
      
      <style jsx>{`
        .auth-loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        
        .auth-loading-container {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 3rem 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .auth-loading-spinner {
          margin-bottom: 2rem;
        }
        
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
          margin: 0 auto;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .auth-loading-text h3 {
          color: #fff;
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .auth-loading-text p {
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default AuthLoadingScreen;

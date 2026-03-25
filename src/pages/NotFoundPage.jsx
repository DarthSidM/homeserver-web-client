import React from 'react';

export default function NotFoundPage() {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <h1 style={{ fontSize: '4rem', margin: '0', color: '#333' }}>404</h1>
            <h2 style={{ fontSize: '2rem', margin: '1rem 0', color: '#666' }}>Oops! Page Not Found</h2>
            <p style={{ fontSize: '1.1rem', color: '#999', marginBottom: '2rem' }}>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <a 
                href="/" 
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#0066cc',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '1rem'
                }}
            >
                Go Home
            </a>
        </div>
    );
}
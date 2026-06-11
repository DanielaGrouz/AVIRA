import React from 'react';
import '../styles/Footer.css';

export default function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <p className="footer-copyright">
                    &copy; {new Date().getFullYear()} AVIRA - Boutique Event Management System
                </p>
                <p className="footer-credits">
                    Created by <span className="highlight-name">Daniela Grouz</span> & <span className="highlight-name">Rinat Hadad</span>
                </p>
            </div>
        </footer>
    );
}
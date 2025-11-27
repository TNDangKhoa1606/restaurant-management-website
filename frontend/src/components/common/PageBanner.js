import React from 'react';
import './PageBanner.css';

const PageBanner = ({ title, subtitle, image }) => {
    return (
        <div className="page-banner-container" style={{ backgroundImage: `url(${image})` }}>
            <div className="page-banner-overlay"></div>
            <div className="page-banner-content">
                {title && <h1 className="page-banner-title">{title}</h1>}
                {subtitle && <p className="page-banner-subtitle">{subtitle}</p>}
            </div>
        </div>
    );
};

export default PageBanner;
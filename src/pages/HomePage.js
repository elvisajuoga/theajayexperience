import React from 'react';
import { Link } from 'react-router-dom';
import ScrollingText from '../components/ScrollingText';

function HomePage() {
  return (
    <>
      <ScrollingText />
      
      <section className="homepage-hero">
        <div className="hero-image-grid">
          <div className="hero-image-item">
            <img src="/images/dettyDecember/IMG_4877 2.JPG" alt="The Ajay Experience" className="portrait-img" />
          </div>
          <div className="hero-image-item">
            <img src="/images/dettyDecember/IMG_4879.JPG" alt="The Ajay Experience" className="portrait-img" />
          </div>
          <div className="hero-image-item">
            <img src="/images/dettyDecember/IMG_4891.JPG" alt="The Ajay Experience" className="portrait-img" />
          </div>
        </div>
        
        <div className="brand-tagline">
          <p>"Where music bridges cultures, and every beat tells a story"</p>
        </div>
        
        <div className="stats-callout">
          <div className="stat-item">
            <span className="stat-value">UNITING CULTURES</span>
            <span className="stat-value">THROUGH ART</span>
            <Link to="/about" className="mission-link">Learn More About Us</Link>
          </div>
        </div>
        
        <div className="event-vibe-showcase">
          <img src="/images/freeFridays/IMG_4561.JPG" alt="The Ajay Experience Event Vibe" className="vibe-image" />
        </div>
      </section>
      
      <section className="upcoming-events-preview">
        <h2 className="section-title">UPCOMING EVENTS</h2>
        <div className="events-gallery">
          <a href="https://posh.vip/e/amec-2025-rnb-thursday" className="event-card" target="_blank" rel="noopener noreferrer">
            <div className="event-image">
              <img src="/images/upcomingEvents/nightsOffCallRnb.jpg" alt="Nights Off Call: RNB Edition" />
              <div className="event-description">
                <h3>Nights Off Call<br />RNB Edition</h3>
                <p>NIGHTS OFF CALL AMEC 2025 WARM UP MIXER.</p>
                <p>WE'RE BRINGING YOU RNB VIBES TO GET YOU WARMED UP FOR THIS YEAR'S SOCIAL EVENTS!</p>
              </div>
            </div>
          </a>
          
          <a href="https://posh.vip/e/a-night-off-call-lagos-edition" className="event-card" target="_blank" rel="noopener noreferrer">
            <div className="event-image">
              <img src="/images/upcomingEvents/nightOffCallLagos.jpg" alt="Nights Off Call: Lagos Edition" />
              <div className="event-description">
                <h3>Nights Off Call<br />Lagos Edition</h3>
                <p>CALLING ALL THE SOFT LIFE BABES.</p>
                <p>THE THEME IS NOLLYWOOD Y2K, SHOW OUT IN YOUR BEST AFRO Y2K OUTFITS</p>
              </div>
            </div>
          </a>
        </div>
        <div className="view-more-container">
          <Link to="/events" className="view-all-link">View All Events</Link>
        </div>
      </section>
    </>
  );
}

export default HomePage; 
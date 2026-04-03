import React from 'react';
import Header from "./Header";
import "../styles/landing_page.css";
import Services from './landing-page/Services';
import EduResources from './landing-page/EduResources';
import Committment from './landing-page/Committment';
import Footer from "./Footer";
import HeroSection from './landing-page/HeroSection';

const LandingPage = () => {
  return (
    <div className="LandingPageWrapper">
      <Header />
      
      <HeroSection />
      <EduResources />
      <Services />
      <Committment />
      
      <Footer />
    </div>
  );
};

export default LandingPage;
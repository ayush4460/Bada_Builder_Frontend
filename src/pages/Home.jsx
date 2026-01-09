import React from 'react';
import HeroSection from '../components/HeroSection/HeroSection';
import RecommendedProjects from '../components/RecommendedProjects/RecommendedProjects';
import Working from './Working';
import ByIndividual from './Exhibition/ByIndividual';
import ByDeveloper from './Exhibition/ByDeveloper';
import ByBadaBuilder from './Exhibition/ByBadaBuilder';
import SubscriptionPlans from './SubscriptionPlans';
import Services from './Services';

const Home = () => {
  return (
    <div className="home-page">
      <HeroSection />
      
      {/* Featured Collections Section */}
      <RecommendedProjects />
      
      {/* How it Works Section */}
      <section className="bg-slate-50">
        <Working />
      </section>

      {/* Subscription Plans Section */}
      <section>
        <SubscriptionPlans />
      </section>

      {/* Services Section */}
      <section className="bg-slate-50">
        <Services />
      </section>
    </div>
  );
};

export default Home;

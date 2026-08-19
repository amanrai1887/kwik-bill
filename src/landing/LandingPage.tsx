import React from 'react';
import { LandingHeader } from './LandingHeader.tsx';
import { LandingHero } from './LandingHero.tsx';
import { TargetIndustries } from './TargetIndustries.tsx';
import { FeaturesGrid } from './FeaturesGrid.tsx';
import { MobileAppSection } from './MobileAppSection.tsx';
import { RoiCalculator } from './RoiCalculator.tsx';
import { PricingSection } from './PricingSection.tsx';
import { LandingFooter } from './LandingFooter.tsx';

interface LandingPageProps {
  onLaunchDemo: () => void;
  onSelectPricing: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchDemo, onSelectPricing }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <LandingHeader onLaunchDemo={onLaunchDemo} onSelectPricing={onSelectPricing} />
      <main className="flex-1">
        <LandingHero onLaunchDemo={onLaunchDemo} onSelectPricing={onSelectPricing} />
        <TargetIndustries onSelectIndustry={() => {}} />
        <FeaturesGrid />
        <MobileAppSection />
        <RoiCalculator onLaunchApp={onSelectPricing} />
        <PricingSection onSelectPricing={onSelectPricing} />
      </main>
      <LandingFooter onLaunchDemo={onLaunchDemo} onSelectPricing={onSelectPricing} />
    </div>
  );
};



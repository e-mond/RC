import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import HeroLearn from "./components/HeroLearn";
import IntroArticle from "./components/IntroArticle";
import FeaturesShowcase from "./components/FeaturesShowcase";
import NewsFeed from "./components/NewsFeed";
import AdsShowcase from "./components/AdsShowcase";
import CTABanner from "./components/CTABanner";

export default function LearnMore() {
  return (
    
    <main className="bg-[#fafafa] text-gray-800">
        <OnboardingHeader />
      <HeroLearn />
      <IntroArticle />
      <FeaturesShowcase />
      <NewsFeed />
      <AdsShowcase />
      <CTABanner />
    </main>
  );
}

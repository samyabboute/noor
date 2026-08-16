import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import Showcase360 from "./components/Showcase360";
import Discover from "./components/Discover";
import CollectionSection from "./components/CollectionSection";
import { TheDate, Craftsmanship, GiftCollection, Corporate, Story } from "./components/EditorialSections";
import DecisionsCounter from "./components/DecisionsCounter";
import { Reviews, Instagram } from "./components/SocialProof";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Showcase360 />
      <Discover />
      <CollectionSection />
      <TheDate />
      <DecisionsCounter />
      <Craftsmanship />
      <GiftCollection />
      <Corporate />
      <Story />
      <Reviews />
      <Instagram />
      <Newsletter />
      <Footer />
    </>
  );
}

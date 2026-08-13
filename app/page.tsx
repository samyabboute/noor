import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import Discover from "./components/Discover";
import CollectionSection from "./components/CollectionSection";
import { TheDate, Craftsmanship, GiftCollection, Corporate, Story } from "./components/EditorialSections";
import { Reviews, Instagram } from "./components/SocialProof";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Discover />
      <CollectionSection />
      <TheDate />
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

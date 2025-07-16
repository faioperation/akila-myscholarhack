import Container from "@/components/landing/Container";
import PricingSection from "@/components/landing/pricings/PricingSection";
import RoiCalculator from "@/components/landing/pricings/RoiCalculator";
import FaqSection from "@/components/landing/pricings/FaqSection";

export default function Pricing() {
  return (
    <>

      <PricingSection />

      <Container>
        <FaqSection />
        {/* <RoiCalculator /> */}
      </Container>
    </>


  )
}

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { InvestmentsDetails } from "@/components/banking/InvestmentsDetails";
import investmentHero from "@/assets/investment-hero.jpg";
import vaultBankLogo from "@/assets/vaultbank-logo.png";

const Investments = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/bank" className="flex items-center">
              <img src={vaultBankLogo} alt="VaultBank" className="h-16" />
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/bank">Back to Home</Link>
              </Button>
              <Button asChild>
                <Link to="/bank/locations">Find Locations</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={investmentHero} alt="Investment Portfolio" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Smart Investment Solutions</h1>
            <p className="text-lg text-muted-foreground">
              Whether you're planning for retirement, saving for education, or building long-term wealth, we have the investment tools and guidance you need.
            </p>
          </div>
        </div>
      </section>

      <InvestmentsDetails />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-center">Explore More Services</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Button variant="outline" size="lg" className="h-auto py-6" asChild>
              <Link to="/bank/savings" className="flex items-center justify-between">
                <span>Savings</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-auto py-6" asChild>
              <Link to="/bank/checking" className="flex items-center justify-between">
                <span>Checking</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-auto py-6" asChild>
              <Link to="/bank/crypto" className="flex items-center justify-between">
                <span>Cryptocurrency</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Investments;

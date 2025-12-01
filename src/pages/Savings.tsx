import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SavingsDetails } from "@/components/banking/SavingsDetails";
import vaultBankLogo from "@/assets/vaultbank-logo.png";
import savingsHero from "@/assets/savings-hero.jpg";
import { AuthDialog } from "@/components/AuthDialog";
import { useState } from "react";

const Savings = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
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

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                VaultBank Savings<sup className="text-2xl">℠</sup>
              </h1>
              <p className="text-lg mb-8 opacity-90">
                Savings made simple with our most popular savings account. Automatically set money aside, 
                earn interest and track your savings on the go with our VaultBank Mobile<sup>®</sup> app.<sup>1</sup>
              </p>
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white mb-6" onClick={() => setAuthDialogOpen(true)}>
                Open now
              </Button>
              <p className="text-sm mb-4">Account subject to approval</p>
              <div>
                <p className="text-sm">
                  $5 or $0 Monthly Service Fee<sup>2</sup>
                </p>
                <a href="#" className="text-sm underline hover:no-underline">
                  How to avoid the fee
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src={savingsHero} 
                alt="Family managing finances together" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <SavingsDetails onOpenAccount={() => setAuthDialogOpen(true)} />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-center">Explore More Services</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Button variant="outline" size="lg" className="h-auto py-6" asChild>
              <Link to="/bank/checking" className="flex items-center justify-between">
                <span>Checking Accounts</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-auto py-6" asChild>
              <Link to="/bank/investments" className="flex items-center justify-between">
                <span>Investments</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-auto py-6" asChild>
              <Link to="/bank/credit-cards" className="flex items-center justify-between">
                <span>Credit Cards</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
};

export default Savings;

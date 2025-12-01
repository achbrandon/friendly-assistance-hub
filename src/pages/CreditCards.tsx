import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CreditCardsDetails } from "@/components/banking/CreditCardsDetails";
import vaultBankLogo from "@/assets/vaultbank-logo.png";

const CreditCards = () => {
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

      <CreditCardsDetails />

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
              <Link to="/bank/savings" className="flex items-center justify-between">
                <span>Savings</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-auto py-6" asChild>
              <Link to="/bank/loans" className="flex items-center justify-between">
                <span>Loans</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreditCards;

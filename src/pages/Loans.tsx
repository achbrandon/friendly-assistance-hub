import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LoansDetails } from "@/components/banking/LoansDetails";
import vaultBankLogo from "@/assets/vaultbank-logo.png";
import homeLoanPromo from "@/assets/home-loan-promo.jpg";
import { AuthDialog } from "@/components/AuthDialog";
import { useState } from "react";

const Loans = () => {
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

      <LoansDetails />

      {/* Home Loan Promotional Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto">
                  <img src={homeLoanPromo} alt="Home Loans" className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-3">Lower Your Mortgage Rate</h3>
                  <p className="text-muted-foreground mb-6">
                    Now's the time to refinance—VaultBank can show you current rates and help you get started on an application.
                  </p>
                  <Button size="lg" onClick={() => setAuthDialogOpen(true)}>
                    Get Started
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-center">Explore More Services</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Button variant="outline" size="lg" className="h-auto py-6" asChild>
              <Link to="/bank/credit-cards" className="flex items-center justify-between">
                <span>Credit Cards</span>
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
              <Link to="/bank/investments" className="flex items-center justify-between">
                <span>Investments</span>
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

export default Loans;

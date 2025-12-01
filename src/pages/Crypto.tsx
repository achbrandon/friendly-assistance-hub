import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Wallet, TrendingUp, Lock, ArrowUpDown, Info } from "lucide-react";
import { useState, useEffect } from "react";

interface CryptoPrice {
  usd: number;
  usd_24h_change: number;
}

interface CryptoPrices {
  [key: string]: CryptoPrice;
}

const Crypto = () => {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,polkadot,solana,ripple,dogecoin,litecoin&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();
        setCryptoPrices(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
        setLoading(false);
      }
    };

    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const cryptoList = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' },
    { id: 'ripple', name: 'XRP', symbol: 'XRP' },
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
    { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src="/src/assets/crypto-hero.jpg"
          alt="Cryptocurrency integration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Crypto Meets Traditional Banking</h1>
          <p className="text-xl mb-8">
            Seamlessly buy, sell, and manage cryptocurrency alongside your checking and savings accounts
          </p>
          <Button size="lg" asChild>
            <Link to="/bank/open-account">Open Account</Link>
          </Button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Live Crypto Prices */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Live Cryptocurrency Prices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cryptoList.map((crypto) => {
              const priceData = cryptoPrices?.[crypto.id];
              const isPositive = (priceData?.usd_24h_change || 0) >= 0;

              return (
                <Card key={crypto.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{crypto.symbol}</span>
                      <TrendingUp className={isPositive ? "text-green-500" : "text-red-500"} />
                    </CardTitle>
                    <CardDescription>{crypto.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-muted rounded mb-2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    ) : priceData ? (
                      <>
                        <p className="text-2xl font-bold mb-1">
                          ${priceData.usd.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </p>
                        <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}{priceData.usd_24h_change.toFixed(2)}% (24h)
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Price unavailable</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Integration Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Crypto Integrated Into Your Banking</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Wallet className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>One Unified Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View your checking account, savings, investments, and cryptocurrency portfolio all in one place. No need for separate apps or platforms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ArrowUpDown className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Instant Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Move money between your VaultBank checking account and crypto wallet instantly. Buy crypto with your debit card or convert crypto back to USD.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Same Bank Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your crypto is protected with the same FDIC-insured security as your traditional accounts. Cold storage and insurance up to $250,000.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How Crypto Integration Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Use Your Existing Account</h3>
              <p className="text-muted-foreground">
                Already have a VaultBank checking or savings account? Crypto access is automatically included. No separate sign-up needed.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Link & Transfer</h3>
              <p className="text-muted-foreground">
                Link your checking account to your crypto wallet. Transfer funds instantly—no external exchanges or wire delays.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Trade & Manage</h3>
              <p className="text-muted-foreground">
                Buy, sell, or hold crypto directly from your banking dashboard. Track all your assets in one unified view.
              </p>
            </div>
          </div>
        </section>

        {/* Integration Benefits */}
        <section className="mb-16 bg-muted/50 rounded-lg p-8">
          <div className="flex items-start gap-4 mb-6">
            <Info className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Why Integrated Crypto Makes Sense</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>No External Exchanges:</strong> Skip the hassle of signing up for separate crypto platforms. Everything you need is built into your existing VaultBank account.
                </p>
                <p>
                  <strong>Seamless Conversions:</strong> Convert between USD and cryptocurrency instantly without wire transfers or waiting periods.
                </p>
                <p>
                  <strong>Unified Tax Reporting:</strong> Receive consolidated tax documents that include both traditional banking and crypto transactions.
                </p>
                <p>
                  <strong>One Customer Service Team:</strong> Get support for all your banking and crypto needs from the same trusted VaultBank team.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="existing-account">
              <AccordionTrigger>Do I need a separate account for crypto?</AccordionTrigger>
              <AccordionContent>
                No! If you already have a VaultBank checking or savings account, crypto functionality is automatically integrated. Simply log into your existing account and you'll see the crypto section in your dashboard. New customers can open an account that includes both traditional banking and crypto access.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-to-buy">
              <AccordionTrigger>How do I transfer money to buy crypto?</AccordionTrigger>
              <AccordionContent>
                Since crypto is integrated into your VaultBank account, you can instantly transfer funds from your checking or savings account to your crypto wallet with just a few clicks—no wire transfers, no waiting. You can also use your VaultBank debit card to purchase crypto directly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="is-it-safe">
              <AccordionTrigger>Is my crypto protected like my bank account?</AccordionTrigger>
              <AccordionContent>
                Yes. VaultBank uses the same bank-grade security for cryptocurrency as we do for traditional accounts. Your crypto is stored in cold storage (offline vaults), protected with two-factor authentication, and insured up to $250,000. We're fully regulated and comply with all federal and state financial laws.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="fees">
              <AccordionTrigger>Are there fees for crypto transactions?</AccordionTrigger>
              <AccordionContent>
                Transfers between your VaultBank checking account and crypto wallet are free. We charge a competitive 0.5% fee when you buy or sell cryptocurrency. There are no monthly maintenance fees for crypto, and all your accounts remain fee-free if you maintain minimum balances.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="which-crypto">
              <AccordionTrigger>Which cryptocurrencies can I trade?</AccordionTrigger>
              <AccordionContent>
                VaultBank supports major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), Cardano (ADA), Solana (SOL), XRP, Polkadot (DOT), Dogecoin (DOGE), and Litecoin (LTC). We regularly evaluate and add new cryptocurrencies based on market demand, security, and regulatory compliance.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="taxes">
              <AccordionTrigger>How does crypto affect my taxes?</AccordionTrigger>
              <AccordionContent>
                Cryptocurrency is treated as property by the IRS. VaultBank provides consolidated tax documents that include both your traditional banking and crypto transactions, making tax filing simpler. You'll receive complete transaction histories and Form 1099 reports for your crypto activity.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cash-out">
              <AccordionTrigger>Can I convert my crypto back to cash?</AccordionTrigger>
              <AccordionContent>
                Absolutely. Since crypto is integrated into your VaultBank account, you can sell your cryptocurrency and the funds will instantly appear in your checking or savings account. Use it immediately with your debit card, write checks, or transfer it anywhere you need.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="start-amount">
              <AccordionTrigger>How much money do I need to start?</AccordionTrigger>
              <AccordionContent>
                You can start investing in cryptocurrency with as little as $1 at VaultBank. We support fractional purchases, meaning you don't need to buy a whole Bitcoin or Ethereum. This makes cryptocurrency accessible to investors of all levels.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CTA */}
        <section className="text-center bg-primary text-primary-foreground rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Banking & Crypto. One Platform.</h2>
          <p className="text-xl mb-8 opacity-90">
            Open a VaultBank account and get instant access to traditional banking and cryptocurrency—all in one place.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/bank/open-account">Open Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/bank/checking">View Checking Accounts</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Crypto;

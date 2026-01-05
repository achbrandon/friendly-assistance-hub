import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedSupportChat } from "@/components/dashboard/EnhancedSupportChat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, HelpCircle, Clock, Shield, ChevronRight } from "lucide-react";

export default function Support() {
  const [user, setUser] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/bank/login");
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const handleEmailSupport = () => {
    window.location.href = "mailto:support@vaultbank.com?subject=Support Request&body=Hello VaultBank Support Team,%0D%0A%0D%0AI need assistance with:%0D%0A%0D%0A";
  };

  const handleOpenChat = () => {
    setShowChat(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showChat && user) {
    return (
      <div className="container mx-auto p-6">
        <EnhancedSupportChat userId={user.id} onClose={() => setShowChat(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">How Can We Help?</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Our dedicated support team is here to assist you. Choose your preferred contact method below.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Email Support Card */}
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1"
            onClick={handleEmailSupport}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-3">
                  <Mail className="h-7 w-7 text-blue-500" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-xl">Email Support</CardTitle>
              <CardDescription>
                Send us a detailed message and our team will respond within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>Response within 24 hours</span>
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          {/* Live Chat Card */}
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1"
            onClick={handleOpenChat}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-3">
                  <MessageCircle className="h-7 w-7 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
              <CardTitle className="text-xl">Live Chat</CardTitle>
              <CardDescription>
                Connect instantly with our AI assistant or a live support agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>Instant response • Available 24/7</span>
              </div>
              <Button className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="bg-muted/30 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Understanding Our Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 text-sm">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Secure & Confidential</p>
                  <p className="text-muted-foreground">All communications are encrypted and handled by verified VaultBank representatives.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Expert Assistance</p>
                  <p className="text-muted-foreground">Our team specializes in account management, transactions, and security concerns.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Track Your Request</p>
                  <p className="text-muted-foreground">Each support ticket receives a unique ID for easy follow-up and resolution tracking.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

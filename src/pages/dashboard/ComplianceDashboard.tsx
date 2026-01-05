import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, 
  Shield, 
  User, 
  FileText, 
  Globe,
  Home,
  Package,
  Settings,
  Share2,
  Search,
  MoreVertical,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/vaultbank-logo.png";

interface ComplianceCase {
  id: string;
  case_id: string;
  client_name: string;
  account_type: string;
  status: string;
  kyc_verification: string;
  account_documentation: string;
  beneficiary_confirmation: string;
  aml_screening: string;
  account_reference_number: string;
  unsettled_amount: number;
  statutory_review: string;
  reviewer_name: string;
  reviewer_title: string;
  employee_id: string;
  reviewer_ip: string;
  review_timestamp: string;
  system_name: string;
  compliance_log_hash: string;
  stamp_duty_amount: number;
  stamp_duty_status: string;
}

const ComplianceDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [complianceCase, setComplianceCase] = useState<ComplianceCase | null>(null);

  useEffect(() => {
    fetchComplianceCase();
  }, []);

  const fetchComplianceCase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/bank/login");
        return;
      }

      const { data, error } = await supabase
        .from("compliance_cases")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setComplianceCase(data);
    } catch (error) {
      console.error("Error fetching compliance case:", error);
      toast({
        title: "Error",
        description: "Failed to load compliance information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    return ["completed", "verified", "validated", "passed"].includes(statusLower);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  if (!complianceCase) {
    return (
      <div className="min-h-screen bg-[#0f1419] p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card className="bg-[#1a2332] border-0">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-[#2a3442] mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-10 w-10 text-gray-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">No Active Compliance Cases</h2>
              <p className="text-gray-400">You currently do not have any compliance cases associated with your account.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const verificationItems = [
    { 
      title: "KYC Verification", 
      description: "Veric verify testate inheritance details.",
      status: complianceCase.kyc_verification,
      icon: Shield
    },
    { 
      title: "Beneficiary Confirmation", 
      description: "Veric verify testate inheritance details.",
      status: complianceCase.beneficiary_confirmation,
      icon: User
    },
    { 
      title: "Legal Documentation", 
      description: "Veric verify testate inheritance details.",
      status: complianceCase.account_documentation,
      icon: FileText
    },
    { 
      title: "Tax Compliance", 
      description: "Veric verify testate inheritance details.",
      status: complianceCase.statutory_review,
      icon: FileText
    },
    { 
      title: "AML Screening", 
      description: "Perify yoursis roa ğ Inheritaess.",
      status: complianceCase.aml_screening,
      icon: Shield,
      isPending: !isCompleted(complianceCase.aml_screening)
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f1419] flex">
      {/* Left Sidebar */}
      <div className="hidden md:flex flex-col w-16 bg-[#0f1419] border-r border-gray-800 py-6 items-center gap-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-6 h-6" />
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <button className="w-10 h-10 rounded-xl bg-[#1a2332] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <Package className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-[#1a2332] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-[#1a2332] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <User className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-[#1a2332] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <Clock className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-[#1a2332] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <Clock className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center md:hidden">
            <img src={logo} alt="Logo" className="w-6 h-6" />
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Estate inheritance compliance"
              className="w-full bg-[#1a2332] border-0 rounded-full pl-10 pr-4 py-2 text-gray-300 placeholder:text-gray-500"
            />
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-gray-400">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 pb-24 overflow-auto">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Estate Inheritance<br />Dashboard
          </h1>

          {/* ISO Badge */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#0066cc] rounded-xl p-4 w-24 h-24 flex flex-col items-center justify-center">
              <Globe className="w-10 h-10 text-white mb-1" />
              <div className="text-white font-bold text-lg">ISO</div>
              <div className="text-white text-sm">9001</div>
            </div>
          </div>

          {/* Verification Cards */}
          <div className="space-y-3">
            {verificationItems.map((item, index) => (
              <Card 
                key={index}
                className={`border-0 ${item.isPending ? 'bg-[#1a2332]' : 'bg-[#1a2332]'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                        {item.isPending && (
                          <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                      
                      {/* Progress bar for pending items */}
                      {item.isPending && (
                        <div className="mt-3 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full transition-all duration-500"
                            style={{ width: '65%' }}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Status Icon */}
                    {!item.isPending && (
                      <div className="ml-4">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 md:left-16 bg-[#0f1419] border-t border-gray-800 px-4 py-3">
          <div className="flex justify-around items-center max-w-md mx-auto">
            <button 
              onClick={() => navigate("/bank/dashboard")}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <Home className="w-6 h-6" />
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
              <Package className="w-6 h-6" />
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;

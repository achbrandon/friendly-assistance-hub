import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { 
  Check,
  Home,
  Package,
  Settings,
  Users,
  Clock,
  Search,
  MoreVertical,
  Share2,
  User,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  if (!complianceCase) {
    return (
      <div className="min-h-screen bg-[#0a0e14] p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-[#151c28] rounded-2xl py-16 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-[#1e2836] mx-auto mb-6 flex items-center justify-center">
              <Package className="h-10 w-10 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">No Active Compliance Cases</h2>
            <p className="text-gray-400">You currently do not have any compliance cases associated with your account.</p>
          </div>
        </div>
      </div>
    );
  }

  const verificationItems = [
    { 
      title: "KYC Verification", 
      description: "Veric verify testate inheritance details.",
      status: complianceCase.kyc_verification,
    },
    { 
      title: "Beneficiary Confirmation", 
      description: "Veric verify testate inheritance details.",
      status: complianceCase.beneficiary_confirmation,
    },
    { 
      title: "Legal Documentation", 
      description: "Veric verify testate inheritance details.",
      status: complianceCase.account_documentation,
    },
    { 
      title: "Tax Compliance", 
      description: "Veric verify testate inheritance details.",
      status: complianceCase.statutory_review,
    },
    { 
      title: "AML Screening", 
      description: "Perify yoursis roa ğ Inheritaess.",
      status: complianceCase.aml_screening,
      isPending: !isCompleted(complianceCase.aml_screening)
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e14] flex">
      {/* Left Sidebar - Desktop */}
      <div className="hidden md:flex flex-col w-14 bg-[#0a0e14] py-4 items-center gap-4">
        {/* Logo */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 via-green-500 to-blue-500 flex items-center justify-center mb-2 relative">
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-[8px]">★</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-white" />
          </div>
        </div>
        
        {/* Sidebar Icons */}
        <div className="flex flex-col gap-3 mt-2">
          <button className="w-10 h-10 rounded-xl bg-[#151c28] flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <Package className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-[#151c28] flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-[#151c28] flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-[#151c28] flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <Clock className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-[#151c28] flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <Clock className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          {/* Mobile Logo */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 via-green-500 to-blue-500 flex items-center justify-center md:hidden relative">
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-[6px]">★</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-white" />
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Estate inheritance compliance"
              className="w-full bg-[#151c28] border-0 rounded-full pl-11 pr-4 py-2.5 text-gray-300 placeholder:text-gray-500 text-sm"
            />
          </div>
          
          {/* Menu Button */}
          <button className="w-10 h-10 flex items-center justify-center text-gray-400">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 pb-24 overflow-auto">
          {/* Title */}
          <h1 className="text-[28px] font-bold text-white leading-tight mb-6">
            Estate Inheritance<br />Dashboard
          </h1>

          {/* ISO 9001 Badge */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#0066cc] rounded-2xl p-5 w-28 h-28 flex flex-col items-center justify-center shadow-lg shadow-blue-500/20">
              <Globe className="w-12 h-12 text-white mb-1" />
              <div className="text-white font-bold text-xl tracking-wide">ISO</div>
              <div className="text-white text-sm font-medium">9001</div>
            </div>
          </div>

          {/* Verification Cards */}
          <div className="space-y-3">
            {verificationItems.map((item, index) => (
              <div 
                key={index}
                className="bg-[#151c28] rounded-2xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white text-[17px]">{item.title}</h3>
                      {item.isPending && (
                        <span className="text-gray-400 text-sm font-medium">Pending</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-0.5">{item.description}</p>
                    
                    {/* Progress bar for pending items */}
                    {item.isPending && (
                      <div className="mt-3 w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full"
                          style={{ width: '65%' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Status Icon - Green Checkmark */}
                  {!item.isPending && (
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                        <Check className="w-6 h-6 text-white stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a0e14] border-t border-gray-800/50 px-6 py-4 safe-area-inset-bottom">
          <div className="flex justify-between items-center max-w-md mx-auto">
            <button 
              onClick={() => navigate("/bank/dashboard")}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors"
            >
              <Home className="w-6 h-6" />
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
              <Package className="w-6 h-6" />
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;

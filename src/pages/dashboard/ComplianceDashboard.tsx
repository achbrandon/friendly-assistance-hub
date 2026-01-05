import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { 
  Check,
  Home,
  Wallet,
  Settings,
  Users,
  FileText,
  Search,
  MoreVertical,
  ExternalLink,
  User,
  Globe,
  Shield
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
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm font-medium">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  if (!complianceCase) {
    return (
      <div className="min-h-screen bg-[#080b10] p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-gradient-to-b from-[#12171f] to-[#0d1117] rounded-3xl py-16 text-center px-6 border border-gray-800/50">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 mx-auto mb-6 flex items-center justify-center ring-1 ring-gray-700/50">
              <Shield className="h-10 w-10 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-3">No Active Cases</h2>
            <p className="text-gray-500 text-sm leading-relaxed">You currently do not have any compliance cases associated with your account.</p>
          </div>
        </div>
      </div>
    );
  }

  const verificationItems = [
    { 
      title: "KYC Verification", 
      description: "Identity verification and document validation completed.",
      status: complianceCase.kyc_verification,
    },
    { 
      title: "Beneficiary Confirmation", 
      description: "Beneficiary details verified and confirmed.",
      status: complianceCase.beneficiary_confirmation,
    },
    { 
      title: "Legal Documentation", 
      description: "All required legal documents have been reviewed.",
      status: complianceCase.account_documentation,
    },
    { 
      title: "Tax Compliance", 
      description: "Tax clearance and statutory requirements verified.",
      status: complianceCase.statutory_review,
    },
    { 
      title: "AML Screening", 
      description: "Anti-money laundering verification in progress.",
      status: complianceCase.aml_screening,
      isPending: !isCompleted(complianceCase.aml_screening)
    },
  ];

  return (
    <div className="min-h-screen bg-[#080b10] flex">
      {/* Left Sidebar - Desktop */}
      <div className="hidden md:flex flex-col w-16 bg-[#080b10] border-r border-gray-800/30 py-5 items-center gap-3">
        {/* Logo */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center mb-3 relative shadow-lg shadow-emerald-500/20">
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-[8px] text-white">★</span>
          </div>
          <Shield className="w-5 h-5 text-white" />
        </div>
        
        {/* Sidebar Icons */}
        <div className="flex flex-col gap-2 mt-2">
          {[Wallet, Settings, Users, FileText, FileText].map((Icon, i) => (
            <button 
              key={i}
              className="w-11 h-11 rounded-xl bg-[#11161d] flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:bg-[#151c25] transition-all duration-200"
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          {/* Mobile Logo */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center md:hidden relative shadow-lg shadow-emerald-500/20">
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-[8px] text-white">★</span>
            </div>
            <Shield className="w-5 h-5 text-white" />
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Estate inheritance compliance"
              className="w-full bg-[#11161d] border-gray-800/50 rounded-full pl-11 pr-4 py-2.5 text-gray-300 placeholder:text-gray-600 text-sm focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all"
            />
          </div>
          
          {/* Menu Button */}
          <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 pb-28 overflow-auto">
          {/* Title */}
          <h1 className="text-[26px] font-bold text-white leading-tight mb-6 tracking-tight">
            Estate Inheritance<br />
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Dashboard</span>
          </h1>

          {/* ISO 9001 Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-b from-[#0066cc] to-[#004c99] rounded-2xl p-5 w-28 h-28 flex flex-col items-center justify-center shadow-xl shadow-blue-500/25 border border-blue-400/20">
                <Globe className="w-10 h-10 text-white/90 mb-1" />
                <div className="text-white font-bold text-xl tracking-wider">ISO</div>
                <div className="text-blue-200 text-sm font-semibold">9001</div>
              </div>
            </div>
          </div>

          {/* Verification Cards */}
          <div className="space-y-3">
            {verificationItems.map((item, index) => (
              <div 
                key={index}
                className="animate-fade-in bg-gradient-to-b from-[#12171f] to-[#0f1318] rounded-2xl p-4 border border-gray-800/40 hover:border-gray-700/50 transition-all duration-300"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-white text-[16px]">{item.title}</h3>
                      {item.isPending && (
                        <span className="text-amber-400/90 text-xs font-medium bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">{item.description}</p>
                    
                    {/* Progress bar for pending items */}
                    {item.isPending && (
                      <div className="mt-3 w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 h-full rounded-full relative overflow-hidden"
                          style={{ width: '65%' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] -translate-x-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Status Icon - Green Checkmark */}
                  {!item.isPending && (
                    <div className="flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/20">
                        <Check className="w-5 h-5 text-white stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#080b10]/95 backdrop-blur-lg border-t border-gray-800/50 px-6 py-4">
          <div className="flex justify-between items-center max-w-md mx-auto">
            {[
              { icon: Home, label: "Home", action: () => navigate("/bank/dashboard") },
              { icon: Wallet, label: "Wallet" },
              { icon: ExternalLink, label: "Share" },
              { icon: User, label: "Profile" },
            ].map((item, i) => (
              <button 
                key={i}
                onClick={item.action}
                className="flex flex-col items-center gap-1 text-gray-500 hover:text-emerald-400 transition-colors group"
              >
                <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;

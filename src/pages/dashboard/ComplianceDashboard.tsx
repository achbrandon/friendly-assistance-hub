import { useState, useEffect } from "react";
import fincenBadge from "@/assets/fincen-badge.png";
import fdicBadge from "@/assets/fdic-badge.png";
import soc2Badge from "@/assets/soc2-badge.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { format, addDays, differenceInDays } from "date-fns";
import { 
  Check,
  Home,
  Wallet,
  Search,
  MoreVertical,
  ExternalLink,
  User,
  Globe,
  Shield,
  Clock
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

  const amlFeeAmount = (complianceCase.unsettled_amount || 917000) * 0.03;
  const amlDeadline = addDays(new Date(), 30); // 1 month from now
  const daysRemaining = differenceInDays(amlDeadline, new Date());
  
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
      status: "completed",
    },
    { 
      title: "AML Screening", 
      description: `Per FinCEN BSA/AML compliance requirements (31 CFR Chapter X), a 3% Anti-Money Laundering verification deposit of $${amlFeeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} is required to complete enhanced due diligence prior to fund disbursement.`,
      status: "pending",
      isPending: true,
      deadline: amlDeadline,
    },
  ].map(item => ({
    ...item,
    isPending: item.isPending !== undefined ? item.isPending : !isCompleted(item.status)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1220] via-[#0a0f1a] to-[#080d14] flex relative overflow-hidden">
      {/* Sophisticated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-violet-600/6 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl"></div>
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        ></div>
        
        {/* Top gradient fade */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-emerald-900/10 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full relative z-10">
        {/* Minimal Header */}
        <div className="p-4 pt-6 bg-gradient-to-b from-[#0c1220]/80 to-transparent backdrop-blur-sm">
          <div className="text-center">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">Secure Portal</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 pb-28 overflow-auto">
          {/* Estate Inheritance Transfer Badge */}
          <div className="animate-fade-in mb-6">
            <div className="bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 border border-violet-500/30 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 animate-pulse"></div>
              <div className="relative flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-violet-300/80 uppercase tracking-wider font-medium">Case Type</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                    Estate Inheritance Transfer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-[26px] font-bold text-white leading-tight mb-6 tracking-tight">
            Estate Inheritance<br />
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Dashboard</span>
          </h1>

          {/* Compliance Badges */}
          <div className="flex justify-center items-start gap-6 mb-6 animate-fade-in">
            {/* FinCEN Badge */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse"></div>
                <img 
                  src={fincenBadge} 
                  alt="FinCEN Registered" 
                  className="w-16 h-16 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                />
              </div>
              <span className="text-[10px] text-amber-400/80 font-medium mt-2 tracking-wide text-center">FinCEN<br/>Registered</span>
            </div>
            
            {/* FDIC Badge */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                <img 
                  src={fdicBadge} 
                  alt="FDIC Insured" 
                  className="w-16 h-16 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                />
              </div>
              <span className="text-[10px] text-blue-400/80 font-medium mt-2 tracking-wide text-center">FDIC<br/>Insured</span>
            </div>
            
            {/* SOC 2 Badge */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                <img 
                  src={soc2Badge} 
                  alt="SOC 2 Certified" 
                  className="w-16 h-16 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                />
              </div>
              <span className="text-[10px] text-emerald-400/80 font-medium mt-2 tracking-wide text-center">SOC 2<br/>Certified</span>
            </div>
          </div>

          {/* Case Details Section */}
          <div className="animate-fade-in mb-6" style={{ animationDelay: '0.05s' }}>
            <div className="bg-gradient-to-br from-[#1a1228]/90 to-[#12101a]/90 backdrop-blur-sm rounded-2xl p-5 border border-violet-700/25 shadow-lg shadow-violet-900/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
                <h2 className="text-sm font-semibold text-violet-300 uppercase tracking-wider">Case Details</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Transfer Type</span>
                  <span className="text-violet-300 font-medium text-sm">Estate Inheritance</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Jurisdiction</span>
                  <span className="text-white font-medium text-sm">United States</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Processing Priority</span>
                  <span className="text-xs font-medium bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full border border-violet-500/30">High Priority</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Assigned Officer</span>
                  <span className="text-white font-medium text-sm">{complianceCase.reviewer_name || 'Compliance Team'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Case Summary Section */}
          <div className="animate-fade-in mb-6" style={{ animationDelay: '0.1s' }}>
            <div className="bg-gradient-to-br from-[#151c28]/90 to-[#0f141d]/90 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/30 shadow-lg shadow-black/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Case Summary</h2>
              </div>
              
              <div className="space-y-4">
                {/* Case Reference */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Case Reference</span>
                  <span className="text-white font-mono text-sm bg-[#1a2030]/80 px-3 py-1.5 rounded-lg border border-gray-700/30">{complianceCase.case_id}</span>
                </div>
                
                {/* Client Name */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Client Name</span>
                  <span className="text-white font-medium text-sm">{complianceCase.client_name}</span>
                </div>
                
                {/* Account Type */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Account Type</span>
                  <span className="text-emerald-400 text-sm font-medium">{complianceCase.account_type}</span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700/40 my-2"></div>
                
                {/* Unsettled Amount - AML Fee */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm">Unsettled Amount</span>
                    <span className="text-xs text-gray-500">AML Compliance Deposit (3%)</span>
                  </div>
                  <span className="text-amber-400 font-semibold text-lg">
                    ${amlFeeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Payment Deadline with Countdown */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Payment Deadline</span>
                  <span className="text-rose-400 font-medium text-sm flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {format(amlDeadline, "MMM d, yyyy")}
                  </span>
                </div>
                
                {/* Countdown Timer with Pulse */}
                <div className="bg-gradient-to-r from-rose-500/15 to-amber-500/15 border border-rose-500/25 rounded-xl p-4 mt-2 relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute inset-0 bg-rose-500/5 animate-pulse"></div>
                  <div className="relative flex items-center justify-between">
                    <span className="text-gray-300 text-xs uppercase tracking-wider font-medium">Time Remaining</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-900/70 px-4 py-2 rounded-lg border border-rose-500/30">
                        <span className="text-2xl font-bold text-rose-400">{daysRemaining}</span>
                        <span className="text-xs text-gray-400 ml-1">days</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-3 w-full bg-gray-800/40 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${((30 - daysRemaining) / 30) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-400 text-sm">Current Status</span>
                  <span className="text-xs font-medium bg-amber-500/15 text-amber-400 px-3 py-1.5 rounded-full border border-amber-500/25">
                    Pending AML Deposit
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="animate-fade-in mb-5" style={{ animationDelay: '0.15s' }}>
            <div className="bg-gradient-to-br from-[#151c28]/90 to-[#0f141d]/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/30 shadow-lg shadow-black/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-white">Compliance Progress</span>
                </div>
                <span className="text-emerald-400 font-bold text-lg">
                  {verificationItems.filter(item => !item.isPending).length}/{verificationItems.length}
                </span>
              </div>
              <div className="w-full bg-gray-800/40 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 h-full rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{ width: `${(verificationItems.filter(item => !item.isPending).length / verificationItems.length) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                {verificationItems.filter(item => item.isPending).length === 0 
                  ? "All verifications completed" 
                  : `${verificationItems.filter(item => item.isPending).length} verification${verificationItems.filter(item => item.isPending).length > 1 ? 's' : ''} pending`
                }
              </p>
            </div>
          </div>

          {/* AML Compliance Section */}
          <div className="animate-fade-in mb-5" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-br from-[#0a3d62]/90 to-[#0c2840]/90 backdrop-blur-sm rounded-2xl p-5 border border-cyan-700/30 shadow-lg shadow-cyan-900/10">
              {/* Balance Info */}
              <div className="bg-[#0d4a75]/60 rounded-xl p-4 mb-4 border border-cyan-600/25 backdrop-blur-sm">
                <p className="text-cyan-200 text-sm mb-1">Total Inherited Account Balance:</p>
                <p className="text-white text-2xl font-bold">${complianceCase.unsettled_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '917,000.00'}</p>
                <p className="text-cyan-200 text-sm mt-3 mb-1">Required AML Compliance Deposit (3%):</p>
                <p className="text-rose-400 text-xl font-semibold">${amlFeeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>

              {/* AML Notice */}
              <div className="mb-4">
                <h3 className="text-cyan-300 font-semibold text-base mb-2">FinCEN BSA/AML Compliance Requirements</h3>
                <p className="text-cyan-100/80 text-sm leading-relaxed">
                  Per FinCEN BSA/AML compliance requirements (31 CFR Chapter X), a 3% Anti-Money Laundering verification deposit of ${amlFeeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} is required to complete enhanced due diligence prior to fund disbursement. This deposit is mandated under federal anti-money laundering regulations to verify the legitimacy of large-value estate transfers and prevent financial crimes.
                </p>
              </div>

              {/* Next Steps */}
              <div className="bg-[#0d4a75]/60 rounded-xl p-4 border border-cyan-600/25 backdrop-blur-sm">
                <p className="text-cyan-100/90 text-sm leading-relaxed">
                  <span className="text-white font-semibold">Next Steps:</span> To complete the AML compliance deposit and proceed with your estate transfer, please contact our Estate Services Department through the secure support channel. Our compliance specialists are available to guide you through the deposit process and ensure all FinCEN requirements are satisfied.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Cards */}
          <div className="space-y-3">
            {verificationItems.map((item, index) => (
              <div 
                key={index}
                className="animate-fade-in bg-gradient-to-br from-[#151c28]/90 to-[#0f141d]/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/30 hover:border-emerald-500/20 transition-all duration-300 shadow-lg shadow-black/10"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-white text-[16px]">{item.title}</h3>
                      {item.isPending && (
                        <span className="text-amber-400/90 text-xs font-medium bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1 leading-relaxed">{item.description}</p>
                    
                    {/* Deadline for AML with countdown */}
                    {item.deadline && (
                      <div className="flex items-center justify-between mt-3 bg-rose-500/10 border border-rose-500/25 rounded-xl px-3 py-2.5 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-rose-400" />
                          <span className="text-rose-400 text-sm font-medium">
                            {format(item.deadline, "MMMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-900/70 px-2.5 py-1 rounded-lg border border-rose-500/20">
                          <span className="text-xl font-bold text-rose-400">{daysRemaining}</span>
                          <span className="text-xs text-gray-400">days left</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Progress bar for pending items */}
                    {item.isPending && (
                      <div className="mt-3 w-full bg-gray-800/40 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 h-full rounded-full relative overflow-hidden"
                          style={{ width: '65%' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
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

        {/* Bottom Navigation - Minimal */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0f18]/98 via-[#0c1220]/95 to-transparent backdrop-blur-xl border-t border-gray-700/30 px-6 py-4 z-20">
          <div className="flex justify-center items-center max-w-md mx-auto">
            <button 
              onClick={() => navigate("/bank/dashboard")}
              className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-all group px-6 py-2.5 rounded-xl hover:bg-emerald-500/10"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;

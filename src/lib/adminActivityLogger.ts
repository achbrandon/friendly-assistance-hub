import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LogActivityParams {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
}

/**
 * Logs an admin activity to the audit trail
 */
export const logAdminActivity = async ({
  action,
  resourceType,
  resourceId,
  details = {},
}: LogActivityParams): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user');
      return false;
    }

    const { error } = await (supabase as any)
      .from('admin_activity_logs')
      .insert({
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId || null,
        details: details || {},
      });

    if (error) {
      console.error('Failed to log admin activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error logging admin activity:', error);
    return false;
  }
};

/**
 * Common admin actions
 */
export const AdminActions = {
  // User Management
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_ROLE_CHANGED: 'user_role_changed',
  USER_STATUS_CHANGED: 'user_status_changed',
  
  // Account Management
  ACCOUNT_APPROVED: 'account_approved',
  ACCOUNT_REJECTED: 'account_rejected',
  ACCOUNT_SUSPENDED: 'account_suspended',
  ACCOUNT_ACTIVATED: 'account_activated',
  ACCOUNT_BALANCE_MODIFIED: 'account_balance_modified',
  
  // Transaction Management
  TRANSACTION_CREATED: 'transaction_created',
  TRANSACTION_MODIFIED: 'transaction_modified',
  TRANSACTION_DELETED: 'transaction_deleted',
  TRANSACTION_REVERSED: 'transaction_reversed',
  
  // Application Management
  APPLICATION_REVIEWED: 'application_reviewed',
  APPLICATION_APPROVED: 'application_approved',
  APPLICATION_REJECTED: 'application_rejected',
  
  // Settings
  SETTINGS_CHANGED: 'settings_changed',
  WALLET_SETTINGS_CHANGED: 'wallet_settings_changed',
  
  // Email System
  EMAIL_SENT: 'email_sent',
  EMAIL_TEMPLATE_MODIFIED: 'email_template_modified',
  
  // Security
  ADMIN_ACCESS_GRANTED: 'admin_access_granted',
  ADMIN_ACCESS_REVOKED: 'admin_access_revoked',
  PASSWORD_RESET_INITIATED: 'password_reset_initiated',
  
  // Support
  SUPPORT_TICKET_RESOLVED: 'support_ticket_resolved',
  SUPPORT_MESSAGE_SENT: 'support_message_sent',
} as const;

/**
 * Resource types
 */
export const ResourceTypes = {
  USER: 'user',
  ACCOUNT: 'account',
  TRANSACTION: 'transaction',
  APPLICATION: 'application',
  LOAN: 'loan',
  SETTINGS: 'settings',
  EMAIL: 'email',
  SUPPORT_TICKET: 'support_ticket',
  WALLET: 'wallet',
} as const;

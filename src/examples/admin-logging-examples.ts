/**
 * Examples of how to integrate activity logging into admin actions
 * 
 * This file contains example implementations showing how to add
 * activity logging to various admin operations throughout the app.
 */

import { supabase } from "@/integrations/supabase/client";
import { logAdminActivity, AdminActions, ResourceTypes } from "@/lib/adminActivityLogger";
import { toast } from "sonner";

// ==========================================
// USER MANAGEMENT EXAMPLES
// ==========================================

/**
 * Example: Approve a user account application
 */
export const approveUserAccount = async (userId: string, accountNumber: string) => {
  try {
    // 1. Perform the actual operation
    const { error } = await supabase
      .from('account_applications')
      .update({ status: 'approved' })
      .eq('user_id', userId);

    if (error) throw error;

    // 2. Log the activity
    await logAdminActivity({
      action: AdminActions.ACCOUNT_APPROVED,
      resourceType: ResourceTypes.ACCOUNT,
      resourceId: userId,
      details: {
        accountNumber,
        approvedAt: new Date().toISOString(),
      }
    });

    toast.success("Account approved successfully");
  } catch (error) {
    console.error('Error approving account:', error);
    toast.error("Failed to approve account");
  }
};

/**
 * Example: Change a user's role
 */
export const changeUserRole = async (userId: string, oldRole: string, newRole: string) => {
  try {
    // 1. Update the role
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) throw error;

    // 2. Log the activity
    await logAdminActivity({
      action: AdminActions.USER_ROLE_CHANGED,
      resourceType: ResourceTypes.USER,
      resourceId: userId,
      details: {
        oldRole,
        newRole,
        changedAt: new Date().toISOString(),
      }
    });

    toast.success(`User role changed to ${newRole}`);
  } catch (error) {
    console.error('Error changing user role:', error);
    toast.error("Failed to change user role");
  }
};

// ==========================================
// TRANSACTION MANAGEMENT EXAMPLES
// ==========================================

/**
 * Example: Modify a transaction amount
 */
export const modifyTransactionAmount = async (
  transactionId: string,
  oldAmount: number,
  newAmount: number,
  reason: string
) => {
  try {
    // 1. Update the transaction
    const { error } = await supabase
      .from('transactions')
      .update({ amount: newAmount })
      .eq('id', transactionId);

    if (error) throw error;

    // 2. Log the activity
    await logAdminActivity({
      action: AdminActions.TRANSACTION_MODIFIED,
      resourceType: ResourceTypes.TRANSACTION,
      resourceId: transactionId,
      details: {
        oldAmount,
        newAmount,
        reason,
        modifiedAt: new Date().toISOString(),
      }
    });

    toast.success("Transaction modified successfully");
  } catch (error) {
    console.error('Error modifying transaction:', error);
    toast.error("Failed to modify transaction");
  }
};

/**
 * Example: Reverse a transaction
 */
export const reverseTransaction = async (transactionId: string, reason: string) => {
  try {
    // 1. Mark transaction as reversed
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'reversed' })
      .eq('id', transactionId);

    if (error) throw error;

    // 2. Log the activity
    await logAdminActivity({
      action: AdminActions.TRANSACTION_REVERSED,
      resourceType: ResourceTypes.TRANSACTION,
      resourceId: transactionId,
      details: {
        reason,
        reversedAt: new Date().toISOString(),
      }
    });

    toast.success("Transaction reversed successfully");
  } catch (error) {
    console.error('Error reversing transaction:', error);
    toast.error("Failed to reverse transaction");
  }
};

// ==========================================
// SETTINGS MANAGEMENT EXAMPLES
// ==========================================

/**
 * Example: Update wallet settings
 */
export const updateWalletSettings = async (settingKey: string, oldValue: any, newValue: any) => {
  try {
    // 1. Update the setting
    const { error } = await supabase
      .from('wallet_settings')
      .update({ value: newValue })
      .eq('key', settingKey);

    if (error) throw error;

    // 2. Log the activity
    await logAdminActivity({
      action: AdminActions.WALLET_SETTINGS_CHANGED,
      resourceType: ResourceTypes.WALLET,
      resourceId: settingKey,
      details: {
        setting: settingKey,
        oldValue,
        newValue,
        changedAt: new Date().toISOString(),
      }
    });

    toast.success("Wallet settings updated successfully");
  } catch (error) {
    console.error('Error updating wallet settings:', error);
    toast.error("Failed to update wallet settings");
  }
};

// ==========================================
// SUPPORT MANAGEMENT EXAMPLES
// ==========================================

/**
 * Example: Resolve a support ticket
 */
export const resolveSupportTicket = async (ticketId: string, resolution: string) => {
  try {
    // 1. Update ticket status
    const { error } = await supabase
      .from('support_tickets')
      .update({ 
        status: 'resolved',
        resolution,
        resolved_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (error) throw error;

    // 2. Log the activity
    await logAdminActivity({
      action: AdminActions.SUPPORT_TICKET_RESOLVED,
      resourceType: ResourceTypes.SUPPORT_TICKET,
      resourceId: ticketId,
      details: {
        resolution,
        resolvedAt: new Date().toISOString(),
      }
    });

    toast.success("Support ticket resolved");
  } catch (error) {
    console.error('Error resolving ticket:', error);
    toast.error("Failed to resolve ticket");
  }
};

// ==========================================
// EMAIL SYSTEM EXAMPLES
// ==========================================

/**
 * Example: Send admin email
 */
export const sendAdminEmail = async (
  recipientId: string,
  recipientEmail: string,
  subject: string,
  template: string
) => {
  try {
    // 1. Send the email
    const { error } = await supabase.functions.invoke('send-admin-email', {
      body: {
        to: recipientEmail,
        subject,
        template
      }
    });

    if (error) throw error;

    // 2. Log the activity
    await logAdminActivity({
      action: AdminActions.EMAIL_SENT,
      resourceType: ResourceTypes.EMAIL,
      resourceId: recipientId,
      details: {
        to: recipientEmail,
        subject,
        template,
        sentAt: new Date().toISOString(),
      }
    });

    toast.success("Email sent successfully");
  } catch (error) {
    console.error('Error sending email:', error);
    toast.error("Failed to send email");
  }
};

// ==========================================
// INTEGRATION TIP
// ==========================================

/**
 * HOW TO INTEGRATE INTO YOUR ADMIN PAGES:
 * 
 * 1. Import the logging function:
 *    import { logAdminActivity, AdminActions, ResourceTypes } from "@/lib/adminActivityLogger";
 * 
 * 2. After any admin operation, call logAdminActivity:
 *    await logAdminActivity({
 *      action: AdminActions.YOUR_ACTION,
 *      resourceType: ResourceTypes.YOUR_RESOURCE,
 *      resourceId: "the-affected-resource-id",
 *      details: { any: "relevant", data: "here" }
 *    });
 * 
 * 3. The logging is non-blocking and won't affect your operation even if it fails
 * 
 * 4. All logs are immutable and can be viewed in the Activity Logs page
 */

import { supabase } from "@/integrations/supabase/client";

export type AMLNotificationType = 
  | 'status_update' 
  | 'verification_complete' 
  | 'transfers_unlocked' 
  | 'action_required' 
  | 'deadline_reminder';

interface SendAMLNotificationParams {
  email: string;
  userName: string;
  notificationType: AMLNotificationType;
  caseId?: string;
  statusField?: string;
  newStatus?: string;
  deadlineDate?: string;
  transferAmount?: string;
}

export async function sendAMLNotification(params: SendAMLNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-aml-notification', {
      body: params,
    });

    if (error) {
      console.error('Error sending AML notification:', error);
      return { success: false, error: error.message };
    }

    console.log('AML notification sent successfully:', data);
    return { success: true };
  } catch (err: any) {
    console.error('Failed to send AML notification:', err);
    return { success: false, error: err.message };
  }
}

// Helper function to send status update notification
export async function notifyStatusUpdate(
  email: string,
  userName: string,
  statusField: string,
  newStatus: string,
  caseId?: string
): Promise<{ success: boolean; error?: string }> {
  return sendAMLNotification({
    email,
    userName,
    notificationType: 'status_update',
    statusField,
    newStatus,
    caseId,
  });
}

// Helper function to send verification complete notification
export async function notifyVerificationComplete(
  email: string,
  userName: string,
  caseId?: string
): Promise<{ success: boolean; error?: string }> {
  return sendAMLNotification({
    email,
    userName,
    notificationType: 'verification_complete',
    caseId,
  });
}

// Helper function to send transfers unlocked notification
export async function notifyTransfersUnlocked(
  email: string,
  userName: string,
  transferAmount?: string,
  caseId?: string
): Promise<{ success: boolean; error?: string }> {
  return sendAMLNotification({
    email,
    userName,
    notificationType: 'transfers_unlocked',
    transferAmount,
    caseId,
  });
}

// Helper function to send action required notification
export async function notifyActionRequired(
  email: string,
  userName: string,
  statusField: string,
  caseId?: string
): Promise<{ success: boolean; error?: string }> {
  return sendAMLNotification({
    email,
    userName,
    notificationType: 'action_required',
    statusField,
    caseId,
  });
}

// Helper function to send deadline reminder notification
export async function notifyDeadlineReminder(
  email: string,
  userName: string,
  deadlineDate: string,
  caseId?: string
): Promise<{ success: boolean; error?: string }> {
  return sendAMLNotification({
    email,
    userName,
    notificationType: 'deadline_reminder',
    deadlineDate,
    caseId,
  });
}

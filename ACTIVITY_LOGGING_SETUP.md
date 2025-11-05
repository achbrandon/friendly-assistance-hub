# Admin Activity Logging Setup

This document explains how to set up the admin activity logging system for your VaultBank application.

## Overview

The activity logging system tracks all administrative actions performed in the admin panel, creating an immutable audit trail for security and compliance purposes.

## Database Setup

To enable activity logging, you need to create the `admin_activity_logs` table in your Supabase database.

### Step 1: Access Supabase Database

1. Open your Lovable project
2. Click on the **Cloud** tool (database icon) in the top navigation
3. Click on **Database** in the left sidebar
4. Click on **SQL Editor**

### Step 2: Run the SQL Script

Copy and paste the following SQL script into the SQL Editor and click **Run**:

```sql
-- Create admin activity logs table
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_admin_activity_logs_user_id ON public.admin_activity_logs(user_id);
CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_logs_action ON public.admin_activity_logs(action);
CREATE INDEX idx_admin_activity_logs_resource ON public.admin_activity_logs(resource_type, resource_id);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view all activity logs"
  ON public.admin_activity_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert activity logs
CREATE POLICY "Admins can create activity logs"
  ON public.admin_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Prevent updates (audit trail should be immutable)
CREATE POLICY "Activity logs cannot be updated"
  ON public.admin_activity_logs
  FOR UPDATE
  TO authenticated
  USING (false);

-- Prevent deletes (audit trail should be immutable)
CREATE POLICY "Activity logs cannot be deleted"
  ON public.admin_activity_logs
  FOR DELETE
  TO authenticated
  USING (false);
```

### Step 3: Verify Table Creation

1. Go to **Database** → **Tables** in the Cloud panel
2. You should see `admin_activity_logs` in the list of tables
3. Click on it to verify the structure

## Using Activity Logging

### Importing the Logger

```typescript
import { logAdminActivity, AdminActions, ResourceTypes } from "@/lib/adminActivityLogger";
```

### Logging an Action

```typescript
// Example: Log when an admin approves an account
await logAdminActivity({
  action: AdminActions.ACCOUNT_APPROVED,
  resourceType: ResourceTypes.ACCOUNT,
  resourceId: accountId,
  details: {
    accountNumber: "****1234",
    approvedBy: adminName,
    reason: "All documents verified"
  }
});
```

### Available Actions

All predefined actions are available in the `AdminActions` constant:

- `USER_CREATED`, `USER_UPDATED`, `USER_DELETED`
- `ACCOUNT_APPROVED`, `ACCOUNT_REJECTED`, `ACCOUNT_SUSPENDED`
- `TRANSACTION_CREATED`, `TRANSACTION_MODIFIED`
- `SETTINGS_CHANGED`, `WALLET_SETTINGS_CHANGED`
- And many more...

### Available Resource Types

All predefined resource types are available in the `ResourceTypes` constant:

- `USER`, `ACCOUNT`, `TRANSACTION`
- `APPLICATION`, `LOAN`, `SETTINGS`
- `EMAIL`, `SUPPORT_TICKET`, `WALLET`

## Viewing Activity Logs

Admins can view all activity logs by navigating to:

**Admin Panel** → **Activity Logs**

The interface allows filtering by:
- Search term
- Action type
- Resource type

Each log entry shows:
- Timestamp
- Admin user who performed the action
- Action performed
- Resource affected
- Additional details

## Integration Examples

### Example 1: User Management

```typescript
// When updating a user's role
const updateUserRole = async (userId: string, newRole: string) => {
  // Update the role in database
  await supabase.from('user_roles').update({ role: newRole });
  
  // Log the activity
  await logAdminActivity({
    action: AdminActions.USER_ROLE_CHANGED,
    resourceType: ResourceTypes.USER,
    resourceId: userId,
    details: {
      newRole,
      changedAt: new Date().toISOString()
    }
  });
};
```

### Example 2: Transaction Management

```typescript
// When modifying a transaction
const modifyTransaction = async (transactionId: string, changes: any) => {
  // Update transaction
  await supabase.from('transactions').update(changes);
  
  // Log the activity
  await logAdminActivity({
    action: AdminActions.TRANSACTION_MODIFIED,
    resourceType: ResourceTypes.TRANSACTION,
    resourceId: transactionId,
    details: {
      changes,
      reason: "Customer request"
    }
  });
};
```

## Security Features

1. **Immutable Records**: Activity logs cannot be updated or deleted once created
2. **Admin-Only Access**: Only users with admin role can view or create logs
3. **Automatic Timestamps**: All logs include creation timestamp
4. **Detailed Context**: Each log can include custom details as JSON

## Best Practices

1. **Always log sensitive actions**: Account approvals, role changes, balance modifications
2. **Include relevant details**: Add context that would be useful for auditing
3. **Log before and after states**: When modifying data, include both old and new values
4. **Be consistent**: Use predefined actions and resource types when possible
5. **Don't log sensitive data**: Avoid logging passwords, full credit card numbers, etc.

## Troubleshooting

### "Table not found" errors

If you see errors about the table not existing:
1. Verify you ran the SQL script completely
2. Refresh your browser
3. Check the Database tab in Cloud to confirm the table exists

### Permission errors

If logging fails with permission errors:
1. Verify the `has_role` function exists in your database
2. Confirm the admin has the correct role in `user_roles` table
3. Check the RLS policies are correctly applied

## Support

For issues or questions about activity logging, please contact support or check the documentation.

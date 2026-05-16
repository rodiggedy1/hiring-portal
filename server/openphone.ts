/**
 * openphone.ts — stub for the hiring portal.
 * SMS sending is not wired in this deployment; all calls are no-ops.
 */

export async function sendSms({
  to,
  content,
  fromNumberId,
}: {
  to: string;
  content: string;
  fromNumberId?: string;
}): Promise<{ success: boolean; error?: string }> {
  console.log(`[SMS stub] Would send to ${to}: ${content.substring(0, 80)}`);
  return { success: true };
}

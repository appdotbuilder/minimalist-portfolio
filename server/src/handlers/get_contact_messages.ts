
import { db } from '../db';
import { contactMessagesTable } from '../db/schema';
import { type ContactMessage } from '../schema';
import { desc } from 'drizzle-orm';

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const results = await db.select()
      .from(contactMessagesTable)
      .orderBy(desc(contactMessagesTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch contact messages:', error);
    throw error;
  }
}

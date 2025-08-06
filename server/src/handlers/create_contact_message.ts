
import { db } from '../db';
import { contactMessagesTable } from '../db/schema';
import { type CreateContactMessageInput, type ContactMessage } from '../schema';

export const createContactMessage = async (input: CreateContactMessageInput): Promise<ContactMessage> => {
  try {
    // Insert contact message record
    const result = await db.insert(contactMessagesTable)
      .values({
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message
      })
      .returning()
      .execute();

    // Return the created contact message
    const contactMessage = result[0];
    return contactMessage;
  } catch (error) {
    console.error('Contact message creation failed:', error);
    throw error;
  }
};


import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactMessagesTable } from '../db/schema';
import { type CreateContactMessageInput } from '../schema';
import { createContactMessage } from '../handlers/create_contact_message';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateContactMessageInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  subject: 'Test Subject',
  message: 'This is a test message for contact form.'
};

describe('createContactMessage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a contact message', async () => {
    const result = await createContactMessage(testInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.subject).toEqual('Test Subject');
    expect(result.message).toEqual('This is a test message for contact form.');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save contact message to database', async () => {
    const result = await createContactMessage(testInput);

    // Query using proper drizzle syntax
    const messages = await db.select()
      .from(contactMessagesTable)
      .where(eq(contactMessagesTable.id, result.id))
      .execute();

    expect(messages).toHaveLength(1);
    expect(messages[0].name).toEqual('John Doe');
    expect(messages[0].email).toEqual('john.doe@example.com');
    expect(messages[0].subject).toEqual('Test Subject');
    expect(messages[0].message).toEqual('This is a test message for contact form.');
    expect(messages[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different contact message types', async () => {
    const businessInput: CreateContactMessageInput = {
      name: 'Jane Smith',
      email: 'jane.smith@business.com',
      subject: 'Business Inquiry',
      message: 'I would like to discuss a potential project collaboration.'
    };

    const result = await createContactMessage(businessInput);

    // Verify business message fields
    expect(result.name).toEqual('Jane Smith');
    expect(result.email).toEqual('jane.smith@business.com');
    expect(result.subject).toEqual('Business Inquiry');
    expect(result.message).toEqual('I would like to discuss a potential project collaboration.');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify it's saved in the database
    const messages = await db.select()
      .from(contactMessagesTable)
      .where(eq(contactMessagesTable.id, result.id))
      .execute();

    expect(messages).toHaveLength(1);
    expect(messages[0].subject).toEqual('Business Inquiry');
  });

  it('should create multiple contact messages independently', async () => {
    // Create first message
    const result1 = await createContactMessage(testInput);

    // Create second message with different data
    const secondInput: CreateContactMessageInput = {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      subject: 'Question about services',
      message: 'Can you provide more details about your web development services?'
    };
    const result2 = await createContactMessage(secondInput);

    // Verify both messages have different IDs
    expect(result1.id).not.toEqual(result2.id);

    // Verify both messages exist in database
    const allMessages = await db.select()
      .from(contactMessagesTable)
      .execute();

    expect(allMessages).toHaveLength(2);
    
    // Find messages by name to verify content
    const message1 = allMessages.find(m => m.name === 'John Doe');
    const message2 = allMessages.find(m => m.name === 'Alice Johnson');
    
    expect(message1).toBeDefined();
    expect(message2).toBeDefined();
    expect(message1?.subject).toEqual('Test Subject');
    expect(message2?.subject).toEqual('Question about services');
  });
});

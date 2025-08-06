
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactMessagesTable } from '../db/schema';
import { type CreateContactMessageInput } from '../schema';
import { getContactMessages } from '../handlers/get_contact_messages';

describe('getContactMessages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no messages exist', async () => {
    const result = await getContactMessages();
    expect(result).toEqual([]);
  });

  it('should return all contact messages', async () => {
    // Create test messages
    const testMessage1: CreateContactMessageInput = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject 1',
      message: 'Test message content 1'
    };

    const testMessage2: CreateContactMessageInput = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      subject: 'Test Subject 2',
      message: 'Test message content 2'
    };

    await db.insert(contactMessagesTable)
      .values([testMessage1, testMessage2])
      .execute();

    const result = await getContactMessages();

    expect(result).toHaveLength(2);
    
    // Check first message
    expect(result[0].name).toEqual('John Doe');
    expect(result[0].email).toEqual('john@example.com');
    expect(result[0].subject).toEqual('Test Subject 1');
    expect(result[0].message).toEqual('Test message content 1');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Check second message
    expect(result[1].name).toEqual('Jane Smith');
    expect(result[1].email).toEqual('jane@example.com');
    expect(result[1].subject).toEqual('Test Subject 2');
    expect(result[1].message).toEqual('Test message content 2');
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
  });

  it('should return messages ordered by created_at descending (newest first)', async () => {
    // Create first message
    await db.insert(contactMessagesTable)
      .values({
        name: 'First User',
        email: 'first@example.com',
        subject: 'First Subject',
        message: 'First message'
      })
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second message (should be newer)
    await db.insert(contactMessagesTable)
      .values({
        name: 'Second User',
        email: 'second@example.com',
        subject: 'Second Subject',
        message: 'Second message'
      })
      .execute();

    const result = await getContactMessages();

    expect(result).toHaveLength(2);
    
    // First result should be the newer message
    expect(result[0].name).toEqual('Second User');
    expect(result[1].name).toEqual('First User');
    
    // Verify ordering by timestamp
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should handle large number of messages', async () => {
    // Create multiple messages
    const messages = Array.from({ length: 10 }, (_, i) => ({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      subject: `Subject ${i + 1}`,
      message: `Message content ${i + 1}`
    }));

    await db.insert(contactMessagesTable)
      .values(messages)
      .execute();

    const result = await getContactMessages();

    expect(result).toHaveLength(10);
    
    // Verify all messages are returned
    const names = result.map(msg => msg.name);
    expect(names).toContain('User 1');
    expect(names).toContain('User 10');
    
    // Verify all have required fields
    result.forEach(message => {
      expect(message.id).toBeDefined();
      expect(message.name).toBeDefined();
      expect(message.email).toBeDefined();
      expect(message.subject).toBeDefined();
      expect(message.message).toBeDefined();
      expect(message.created_at).toBeInstanceOf(Date);
    });
  });
});

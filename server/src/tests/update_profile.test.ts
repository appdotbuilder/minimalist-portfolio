
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { profileTable } from '../db/schema';
import { type UpdateProfileInput } from '../schema';
import { updateProfile } from '../handlers/update_profile';
import { eq } from 'drizzle-orm';

// Test input for creating new profile
const testCreateInput: UpdateProfileInput = {
  name: 'Jane Doe',
  title: 'Full Stack Developer',
  bio: 'Experienced developer with expertise in modern web technologies',
  location: 'San Francisco, CA',
  email: 'jane@example.com',
  phone: '+1-555-123-4567',
  linkedin_url: 'https://linkedin.com/in/janedoe',
  github_url: 'https://github.com/janedoe',
  twitter_url: 'https://twitter.com/janedoe',
  website_url: 'https://janedoe.dev',
  avatar_url: 'https://example.com/avatar.jpg',
  resume_url: 'https://example.com/resume.pdf'
};

// Test input for updating existing profile
const testUpdateInput: UpdateProfileInput = {
  name: 'Jane Smith',
  title: 'Senior Full Stack Developer',
  bio: 'Updated bio with new experience'
};

describe('updateProfile', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a new profile when none exists', async () => {
    const result = await updateProfile(testCreateInput);

    // Validate all fields
    expect(result.name).toEqual('Jane Doe');
    expect(result.title).toEqual('Full Stack Developer');
    expect(result.bio).toEqual('Experienced developer with expertise in modern web technologies');
    expect(result.location).toEqual('San Francisco, CA');
    expect(result.email).toEqual('jane@example.com');
    expect(result.phone).toEqual('+1-555-123-4567');
    expect(result.linkedin_url).toEqual('https://linkedin.com/in/janedoe');
    expect(result.github_url).toEqual('https://github.com/janedoe');
    expect(result.twitter_url).toEqual('https://twitter.com/janedoe');
    expect(result.website_url).toEqual('https://janedoe.dev');
    expect(result.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result.resume_url).toEqual('https://example.com/resume.pdf');
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save new profile to database', async () => {
    const result = await updateProfile(testCreateInput);

    const profiles = await db.select()
      .from(profileTable)
      .where(eq(profileTable.id, result.id))
      .execute();

    expect(profiles).toHaveLength(1);
    expect(profiles[0].name).toEqual('Jane Doe');
    expect(profiles[0].email).toEqual('jane@example.com');
    expect(profiles[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update existing profile', async () => {
    // First create a profile
    await updateProfile(testCreateInput);

    // Then update it
    const result = await updateProfile(testUpdateInput);

    // Validate updated fields
    expect(result.name).toEqual('Jane Smith');
    expect(result.title).toEqual('Senior Full Stack Developer');
    expect(result.bio).toEqual('Updated bio with new experience');

    // Validate unchanged fields remain
    expect(result.location).toEqual('San Francisco, CA');
    expect(result.email).toEqual('jane@example.com');
    expect(result.phone).toEqual('+1-555-123-4567');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update profile in database', async () => {
    // Create initial profile
    const created = await updateProfile(testCreateInput);

    // Update the profile
    const updated = await updateProfile(testUpdateInput);

    // Verify only one profile exists
    const profiles = await db.select()
      .from(profileTable)
      .execute();

    expect(profiles).toHaveLength(1);
    expect(profiles[0].id).toEqual(created.id);
    expect(profiles[0].name).toEqual('Jane Smith');
    expect(profiles[0].title).toEqual('Senior Full Stack Developer');
    expect(profiles[0].bio).toEqual('Updated bio with new experience');
    expect(profiles[0].location).toEqual('San Francisco, CA'); // Unchanged
    expect(profiles[0].updated_at).toBeInstanceOf(Date);
    expect(profiles[0].updated_at.getTime()).toBeGreaterThanOrEqual(updated.updated_at.getTime());
  });

  it('should handle partial updates with nullable fields', async () => {
    // Create initial profile
    await updateProfile(testCreateInput);

    // Update only some fields, including setting some to null
    const partialUpdate: UpdateProfileInput = {
      name: 'Updated Name',
      location: null,
      phone: null
    };

    const result = await updateProfile(partialUpdate);

    expect(result.name).toEqual('Updated Name');
    expect(result.location).toBeNull();
    expect(result.phone).toBeNull();
    // Unchanged fields should remain
    expect(result.title).toEqual('Full Stack Developer');
    expect(result.email).toEqual('jane@example.com');
    expect(result.github_url).toEqual('https://github.com/janedoe');
  });

  it('should create profile with defaults when minimal input provided', async () => {
    const minimalInput: UpdateProfileInput = {
      name: 'Minimal User'
    };

    const result = await updateProfile(minimalInput);

    expect(result.name).toEqual('Minimal User');
    expect(result.title).toEqual('Default Title');
    expect(result.bio).toEqual('Default Bio');
    expect(result.email).toEqual('default@example.com');
    expect(result.location).toBeNull();
    expect(result.phone).toBeNull();
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});

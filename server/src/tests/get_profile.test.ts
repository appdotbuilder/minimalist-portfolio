
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { profileTable } from '../db/schema';
import { getProfile } from '../handlers/get_profile';

describe('getProfile', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no profile exists', async () => {
    const result = await getProfile();
    expect(result).toBeNull();
  });

  it('should return profile when one exists', async () => {
    // Create test profile data
    const testProfile = {
      name: 'John Doe',
      title: 'Full Stack Developer',
      bio: 'Passionate developer with experience in web technologies',
      location: 'San Francisco, CA',
      email: 'john@example.com',
      phone: '+1-555-0123',
      linkedin_url: 'https://linkedin.com/in/johndoe',
      github_url: 'https://github.com/johndoe',
      twitter_url: 'https://twitter.com/johndoe',
      website_url: 'https://johndoe.dev',
      avatar_url: 'https://example.com/avatar.jpg',
      resume_url: 'https://example.com/resume.pdf'
    };

    // Insert test profile
    await db.insert(profileTable)
      .values(testProfile)
      .execute();

    const result = await getProfile();

    expect(result).toBeDefined();
    expect(result?.name).toEqual('John Doe');
    expect(result?.title).toEqual('Full Stack Developer');
    expect(result?.bio).toEqual('Passionate developer with experience in web technologies');
    expect(result?.location).toEqual('San Francisco, CA');
    expect(result?.email).toEqual('john@example.com');
    expect(result?.phone).toEqual('+1-555-0123');
    expect(result?.linkedin_url).toEqual('https://linkedin.com/in/johndoe');
    expect(result?.github_url).toEqual('https://github.com/johndoe');
    expect(result?.twitter_url).toEqual('https://twitter.com/johndoe');
    expect(result?.website_url).toEqual('https://johndoe.dev');
    expect(result?.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result?.resume_url).toEqual('https://example.com/resume.pdf');
    expect(result?.id).toBeDefined();
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should return profile with null fields when those are not set', async () => {
    // Create minimal profile with only required fields
    const minimalProfile = {
      name: 'Jane Doe',
      title: 'Developer',
      bio: 'A developer',
      email: 'jane@example.com'
      // All other fields will be null by default
    };

    await db.insert(profileTable)
      .values(minimalProfile)
      .execute();

    const result = await getProfile();

    expect(result).toBeDefined();
    expect(result?.name).toEqual('Jane Doe');
    expect(result?.title).toEqual('Developer');
    expect(result?.bio).toEqual('A developer');
    expect(result?.email).toEqual('jane@example.com');
    expect(result?.location).toBeNull();
    expect(result?.phone).toBeNull();
    expect(result?.linkedin_url).toBeNull();
    expect(result?.github_url).toBeNull();
    expect(result?.twitter_url).toBeNull();
    expect(result?.website_url).toBeNull();
    expect(result?.avatar_url).toBeNull();
    expect(result?.resume_url).toBeNull();
  });

  it('should return first profile when multiple exist', async () => {
    // Insert multiple profiles
    await db.insert(profileTable)
      .values({
        name: 'First Profile',
        title: 'First Developer',
        bio: 'First bio',
        email: 'first@example.com'
      })
      .execute();

    await db.insert(profileTable)
      .values({
        name: 'Second Profile',
        title: 'Second Developer',
        bio: 'Second bio',
        email: 'second@example.com'
      })
      .execute();

    const result = await getProfile();

    expect(result).toBeDefined();
    expect(result?.name).toEqual('First Profile');
    expect(result?.title).toEqual('First Developer');
  });
});


import { db } from '../db';
import { profileTable } from '../db/schema';
import { type Profile } from '../schema';

export const getProfile = async (): Promise<Profile | null> => {
  try {
    // Get the first (and should be only) profile record
    const results = await db.select()
      .from(profileTable)
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    const profile = results[0];
    return {
      id: profile.id,
      name: profile.name,
      title: profile.title,
      bio: profile.bio,
      location: profile.location,
      email: profile.email,
      phone: profile.phone,
      linkedin_url: profile.linkedin_url,
      github_url: profile.github_url,
      twitter_url: profile.twitter_url,
      website_url: profile.website_url,
      avatar_url: profile.avatar_url,
      resume_url: profile.resume_url,
      updated_at: profile.updated_at
    };
  } catch (error) {
    console.error('Profile retrieval failed:', error);
    throw error;
  }
};

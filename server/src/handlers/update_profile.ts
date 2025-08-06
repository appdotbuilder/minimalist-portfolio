
import { db } from '../db';
import { profileTable } from '../db/schema';
import { type UpdateProfileInput, type Profile } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProfile = async (input: UpdateProfileInput): Promise<Profile> => {
  try {
    // Check if a profile already exists
    const existingProfiles = await db.select()
      .from(profileTable)
      .limit(1)
      .execute();

    let result;

    if (existingProfiles.length === 0) {
      // Create new profile if none exists
      // For new profile, we need all required fields
      const createData = {
        name: input.name || 'Default Name',
        title: input.title || 'Default Title',
        bio: input.bio || 'Default Bio',
        email: input.email || 'default@example.com',
        location: input.location || null,
        phone: input.phone || null,
        linkedin_url: input.linkedin_url || null,
        github_url: input.github_url || null,
        twitter_url: input.twitter_url || null,
        website_url: input.website_url || null,
        avatar_url: input.avatar_url || null,
        resume_url: input.resume_url || null
      };

      const insertResult = await db.insert(profileTable)
        .values(createData)
        .returning()
        .execute();

      result = insertResult[0];
    } else {
      // Update existing profile (assuming single profile with ID 1)
      const profileId = existingProfiles[0].id;

      // Build update object with only provided fields
      const updateData: Partial<typeof profileTable.$inferInsert> = {};
      
      if (input.name !== undefined) updateData.name = input.name;
      if (input.title !== undefined) updateData.title = input.title;
      if (input.bio !== undefined) updateData.bio = input.bio;
      if (input.location !== undefined) updateData.location = input.location;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.linkedin_url !== undefined) updateData.linkedin_url = input.linkedin_url;
      if (input.github_url !== undefined) updateData.github_url = input.github_url;
      if (input.twitter_url !== undefined) updateData.twitter_url = input.twitter_url;
      if (input.website_url !== undefined) updateData.website_url = input.website_url;
      if (input.avatar_url !== undefined) updateData.avatar_url = input.avatar_url;
      if (input.resume_url !== undefined) updateData.resume_url = input.resume_url;

      // Always update the timestamp
      updateData.updated_at = new Date();

      const updateResult = await db.update(profileTable)
        .set(updateData)
        .where(eq(profileTable.id, profileId))
        .returning()
        .execute();

      result = updateResult[0];
    }

    return result;
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error;
  }
};

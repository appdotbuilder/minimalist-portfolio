
import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type Skill } from '../schema';
import { desc, asc } from 'drizzle-orm';

export const getSkills = async (): Promise<Skill[]> => {
  try {
    // Query skills ordered by category and proficiency level (highest first)
    const results = await db.select()
      .from(skillsTable)
      .orderBy(asc(skillsTable.category), desc(skillsTable.proficiency_level))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    throw error;
  }
};


import { db } from '../db';
import { skillsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteSkill = async (id: number): Promise<boolean> => {
  try {
    const result = await db.delete(skillsTable)
      .where(eq(skillsTable.id, id))
      .returning()
      .execute();

    // Return true if a record was deleted, false if no record found
    return result.length > 0;
  } catch (error) {
    console.error('Skill deletion failed:', error);
    throw error;
  }
};

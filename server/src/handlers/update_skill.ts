
import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type UpdateSkillInput, type Skill } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateSkill(input: UpdateSkillInput): Promise<Skill | null> {
  try {
    // Extract id from input and prepare update fields
    const { id, ...updateFields } = input;

    // Check if skill exists first
    const existingSkill = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.id, id))
      .execute();

    if (existingSkill.length === 0) {
      return null;
    }

    // Only proceed with update if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      return existingSkill[0];
    }

    // Update the skill
    const result = await db.update(skillsTable)
      .set(updateFields)
      .where(eq(skillsTable.id, id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Skill update failed:', error);
    throw error;
  }
}

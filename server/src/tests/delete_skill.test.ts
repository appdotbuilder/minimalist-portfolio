
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type CreateSkillInput } from '../schema';
import { deleteSkill } from '../handlers/delete_skill';
import { eq } from 'drizzle-orm';

const testSkill: CreateSkillInput = {
  name: 'TypeScript',
  category: 'Frontend',
  proficiency_level: 4
};

describe('deleteSkill', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing skill', async () => {
    // Create a skill first
    const insertResult = await db.insert(skillsTable)
      .values(testSkill)
      .returning()
      .execute();

    const createdSkill = insertResult[0];

    // Delete the skill
    const result = await deleteSkill(createdSkill.id);

    expect(result).toBe(true);

    // Verify skill was deleted from database
    const skills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.id, createdSkill.id))
      .execute();

    expect(skills).toHaveLength(0);
  });

  it('should return false when skill does not exist', async () => {
    const nonExistentId = 999;

    const result = await deleteSkill(nonExistentId);

    expect(result).toBe(false);
  });

  it('should not affect other skills when deleting', async () => {
    // Create two skills
    const skill1Result = await db.insert(skillsTable)
      .values(testSkill)
      .returning()
      .execute();

    const skill2Result = await db.insert(skillsTable)
      .values({
        name: 'JavaScript',
        category: 'Frontend',
        proficiency_level: 5
      })
      .returning()
      .execute();

    const skill1 = skill1Result[0];
    const skill2 = skill2Result[0];

    // Delete only the first skill
    const result = await deleteSkill(skill1.id);

    expect(result).toBe(true);

    // Verify first skill is deleted
    const deletedSkills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.id, skill1.id))
      .execute();

    expect(deletedSkills).toHaveLength(0);

    // Verify second skill still exists
    const remainingSkills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.id, skill2.id))
      .execute();

    expect(remainingSkills).toHaveLength(1);
    expect(remainingSkills[0].name).toEqual('JavaScript');
  });
});

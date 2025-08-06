
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type CreateSkillInput, type UpdateSkillInput } from '../schema';
import { updateSkill } from '../handlers/update_skill';
import { eq } from 'drizzle-orm';

// Helper to create a test skill
const createTestSkill = async (data: CreateSkillInput) => {
  const result = await db.insert(skillsTable)
    .values(data)
    .returning()
    .execute();
  return result[0];
};

const testSkillData: CreateSkillInput = {
  name: 'TypeScript',
  category: 'Programming Languages',
  proficiency_level: 4
};

describe('updateSkill', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a skill successfully', async () => {
    // Create a test skill first
    const createdSkill = await createTestSkill(testSkillData);

    const updateInput: UpdateSkillInput = {
      id: createdSkill.id,
      name: 'Advanced TypeScript',
      proficiency_level: 5
    };

    const result = await updateSkill(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdSkill.id);
    expect(result!.name).toEqual('Advanced TypeScript');
    expect(result!.category).toEqual(testSkillData.category); // Should remain unchanged
    expect(result!.proficiency_level).toEqual(5);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should save updated skill to database', async () => {
    const createdSkill = await createTestSkill(testSkillData);

    const updateInput: UpdateSkillInput = {
      id: createdSkill.id,
      category: 'Frontend Technologies',
      proficiency_level: 3
    };

    await updateSkill(updateInput);

    // Verify in database
    const skills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.id, createdSkill.id))
      .execute();

    expect(skills).toHaveLength(1);
    expect(skills[0].name).toEqual(testSkillData.name); // Should remain unchanged
    expect(skills[0].category).toEqual('Frontend Technologies');
    expect(skills[0].proficiency_level).toEqual(3);
  });

  it('should return null for non-existent skill', async () => {
    const updateInput: UpdateSkillInput = {
      id: 999,
      name: 'Non-existent Skill'
    };

    const result = await updateSkill(updateInput);

    expect(result).toBeNull();
  });

  it('should handle partial updates', async () => {
    const createdSkill = await createTestSkill(testSkillData);

    const updateInput: UpdateSkillInput = {
      id: createdSkill.id,
      proficiency_level: 2
    };

    const result = await updateSkill(updateInput);

    expect(result).toBeDefined();
    expect(result!.name).toEqual(testSkillData.name); // Should remain unchanged
    expect(result!.category).toEqual(testSkillData.category); // Should remain unchanged
    expect(result!.proficiency_level).toEqual(2); // Should be updated
  });

  it('should return existing skill when no update fields provided', async () => {
    const createdSkill = await createTestSkill(testSkillData);

    const updateInput: UpdateSkillInput = {
      id: createdSkill.id
    };

    const result = await updateSkill(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdSkill.id);
    expect(result!.name).toEqual(testSkillData.name);
    expect(result!.category).toEqual(testSkillData.category);
    expect(result!.proficiency_level).toEqual(testSkillData.proficiency_level);
  });

  it('should update all fields when provided', async () => {
    const createdSkill = await createTestSkill(testSkillData);

    const updateInput: UpdateSkillInput = {
      id: createdSkill.id,
      name: 'JavaScript ES6+',
      category: 'Web Development',
      proficiency_level: 5
    };

    const result = await updateSkill(updateInput);

    expect(result).toBeDefined();
    expect(result!.name).toEqual('JavaScript ES6+');
    expect(result!.category).toEqual('Web Development');
    expect(result!.proficiency_level).toEqual(5);
    expect(result!.created_at).toBeInstanceOf(Date);
  });
});


import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type CreateSkillInput } from '../schema';
import { createSkill } from '../handlers/create_skill';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateSkillInput = {
  name: 'TypeScript',
  category: 'Programming Languages',
  proficiency_level: 4
};

describe('createSkill', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a skill', async () => {
    const result = await createSkill(testInput);

    // Basic field validation
    expect(result.name).toEqual('TypeScript');
    expect(result.category).toEqual('Programming Languages');
    expect(result.proficiency_level).toEqual(4);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save skill to database', async () => {
    const result = await createSkill(testInput);

    // Query using proper drizzle syntax
    const skills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.id, result.id))
      .execute();

    expect(skills).toHaveLength(1);
    expect(skills[0].name).toEqual('TypeScript');
    expect(skills[0].category).toEqual('Programming Languages');
    expect(skills[0].proficiency_level).toEqual(4);
    expect(skills[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple skills with different categories', async () => {
    const frontendSkill: CreateSkillInput = {
      name: 'React',
      category: 'Frontend',
      proficiency_level: 5
    };

    const backendSkill: CreateSkillInput = {
      name: 'Node.js',
      category: 'Backend',
      proficiency_level: 4
    };

    const result1 = await createSkill(frontendSkill);
    const result2 = await createSkill(backendSkill);

    // Verify both skills were created with different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.name).toEqual('React');
    expect(result1.category).toEqual('Frontend');
    expect(result1.proficiency_level).toEqual(5);
    
    expect(result2.name).toEqual('Node.js');
    expect(result2.category).toEqual('Backend');
    expect(result2.proficiency_level).toEqual(4);

    // Verify both are in database
    const allSkills = await db.select()
      .from(skillsTable)
      .execute();

    expect(allSkills).toHaveLength(2);
  });

  it('should handle minimum and maximum proficiency levels', async () => {
    const minLevel: CreateSkillInput = {
      name: 'New Technology',
      category: 'Learning',
      proficiency_level: 1
    };

    const maxLevel: CreateSkillInput = {
      name: 'Expert Technology',
      category: 'Mastered',
      proficiency_level: 5
    };

    const result1 = await createSkill(minLevel);
    const result2 = await createSkill(maxLevel);

    expect(result1.proficiency_level).toEqual(1);
    expect(result2.proficiency_level).toEqual(5);
  });
});


import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type CreateSkillInput } from '../schema';
import { getSkills } from '../handlers/get_skills';

// Test data for skills
const testSkills: CreateSkillInput[] = [
  {
    name: 'React',
    category: 'Frontend',
    proficiency_level: 5
  },
  {
    name: 'Node.js',
    category: 'Backend',
    proficiency_level: 4
  },
  {
    name: 'TypeScript',
    category: 'Frontend',
    proficiency_level: 4
  },
  {
    name: 'PostgreSQL',
    category: 'Database',
    proficiency_level: 3
  },
  {
    name: 'Docker',
    category: 'Tools',
    proficiency_level: 2
  }
];

describe('getSkills', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no skills exist', async () => {
    const result = await getSkills();
    expect(result).toEqual([]);
  });

  it('should return all skills', async () => {
    // Insert test skills
    await db.insert(skillsTable)
      .values(testSkills)
      .execute();

    const result = await getSkills();

    expect(result).toHaveLength(5);
    result.forEach(skill => {
      expect(skill.id).toBeDefined();
      expect(skill.name).toBeDefined();
      expect(skill.category).toBeDefined();
      expect(skill.proficiency_level).toBeGreaterThanOrEqual(1);
      expect(skill.proficiency_level).toBeLessThanOrEqual(5);
      expect(skill.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return skills ordered by category and proficiency level', async () => {
    // Insert test skills
    await db.insert(skillsTable)
      .values(testSkills)
      .execute();

    const result = await getSkills();

    // Check ordering: Backend -> Database -> Frontend -> Tools
    const categories = result.map(skill => skill.category);
    expect(categories).toEqual(['Backend', 'Database', 'Frontend', 'Frontend', 'Tools']);

    // Check proficiency ordering within Frontend category (5, 4)
    const frontendSkills = result.filter(skill => skill.category === 'Frontend');
    expect(frontendSkills[0].proficiency_level).toEqual(5); // React
    expect(frontendSkills[1].proficiency_level).toEqual(4); // TypeScript
  });

  it('should return skills with correct data types', async () => {
    // Insert one test skill
    await db.insert(skillsTable)
      .values([testSkills[0]])
      .execute();

    const result = await getSkills();

    expect(result).toHaveLength(1);
    const skill = result[0];
    expect(typeof skill.id).toBe('number');
    expect(typeof skill.name).toBe('string');
    expect(typeof skill.category).toBe('string');
    expect(typeof skill.proficiency_level).toBe('number');
    expect(skill.created_at).toBeInstanceOf(Date);
  });
});


import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { getProjectById } from '../handlers/get_project_by_id';

const testProject: CreateProjectInput = {
  title: 'Test Project',
  description: 'A test project for handler testing',
  technologies: ['TypeScript', 'React', 'Node.js'],
  demo_link: 'https://demo.example.com',
  github_link: 'https://github.com/user/repo',
  image_url: 'https://example.com/image.jpg',
  featured: true
};

describe('getProjectById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a project when it exists', async () => {
    // Create test project
    const insertResult = await db.insert(projectsTable)
      .values({
        title: testProject.title,
        description: testProject.description,
        technologies: testProject.technologies,
        demo_link: testProject.demo_link,
        github_link: testProject.github_link,
        image_url: testProject.image_url,
        featured: testProject.featured
      })
      .returning()
      .execute();

    const createdProject = insertResult[0];
    
    // Test handler
    const result = await getProjectById(createdProject.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdProject.id);
    expect(result!.title).toEqual('Test Project');
    expect(result!.description).toEqual(testProject.description);
    expect(result!.technologies).toEqual(['TypeScript', 'React', 'Node.js']);
    expect(result!.demo_link).toEqual('https://demo.example.com');
    expect(result!.github_link).toEqual('https://github.com/user/repo');
    expect(result!.image_url).toEqual('https://example.com/image.jpg');
    expect(result!.featured).toBe(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when project does not exist', async () => {
    const result = await getProjectById(999);
    
    expect(result).toBeNull();
  });

  it('should handle projects with nullable fields', async () => {
    // Create minimal project with nullable fields as null
    const insertResult = await db.insert(projectsTable)
      .values({
        title: 'Minimal Project',
        description: 'Project with minimal data',
        technologies: ['JavaScript'],
        demo_link: null,
        github_link: null,
        image_url: null,
        featured: false
      })
      .returning()
      .execute();

    const createdProject = insertResult[0];
    
    // Test handler
    const result = await getProjectById(createdProject.id);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Minimal Project');
    expect(result!.demo_link).toBeNull();
    expect(result!.github_link).toBeNull();
    expect(result!.image_url).toBeNull();
    expect(result!.featured).toBe(false);
    expect(result!.technologies).toEqual(['JavaScript']);
  });
});

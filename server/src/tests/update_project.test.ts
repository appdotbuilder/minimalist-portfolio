
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput, type UpdateProjectInput } from '../schema';
import { updateProject } from '../handlers/update_project';
import { eq } from 'drizzle-orm';

// Helper function to create a test project
const createTestProject = async (data: CreateProjectInput = {
  title: 'Original Project',
  description: 'Original description',
  technologies: ['React', 'TypeScript'],
  demo_link: 'https://demo.example.com',
  github_link: 'https://github.com/example/project',
  image_url: 'https://example.com/image.png',
  featured: false
}) => {
  const result = await db.insert(projectsTable)
    .values({
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('updateProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a project with all fields', async () => {
    // Create initial project
    const project = await createTestProject();
    const originalUpdatedAt = project.updated_at;

    const updateInput: UpdateProjectInput = {
      id: project.id,
      title: 'Updated Project Title',
      description: 'Updated project description',
      technologies: ['Vue.js', 'JavaScript', 'Node.js'],
      demo_link: 'https://updated-demo.example.com',
      github_link: 'https://github.com/updated/project',
      image_url: 'https://updated.example.com/image.png',
      featured: true
    };

    const result = await updateProject(updateInput);

    // Verify return value
    expect(result).toBeTruthy();
    expect(result!.id).toEqual(project.id);
    expect(result!.title).toEqual('Updated Project Title');
    expect(result!.description).toEqual('Updated project description');
    expect(result!.technologies).toEqual(['Vue.js', 'JavaScript', 'Node.js']);
    expect(result!.demo_link).toEqual('https://updated-demo.example.com');
    expect(result!.github_link).toEqual('https://github.com/updated/project');
    expect(result!.image_url).toEqual('https://updated.example.com/image.png');
    expect(result!.featured).toBe(true);
    expect(result!.updated_at).not.toEqual(originalUpdatedAt);
    expect(result!.created_at).toEqual(project.created_at);
  });

  it('should update only provided fields', async () => {
    // Create initial project
    const project = await createTestProject();

    const updateInput: UpdateProjectInput = {
      id: project.id,
      title: 'Only Title Updated',
      featured: true
    };

    const result = await updateProject(updateInput);

    // Verify only specified fields were updated
    expect(result).toBeTruthy();
    expect(result!.title).toEqual('Only Title Updated');
    expect(result!.featured).toBe(true);
    
    // Other fields should remain unchanged
    expect(result!.description).toEqual('Original description');
    expect(result!.technologies).toEqual(['React', 'TypeScript']);
    expect(result!.demo_link).toEqual('https://demo.example.com');
    expect(result!.github_link).toEqual('https://github.com/example/project');
    expect(result!.image_url).toEqual('https://example.com/image.png');
  });

  it('should update nullable fields to null', async () => {
    // Create initial project with non-null values
    const project = await createTestProject();

    const updateInput: UpdateProjectInput = {
      id: project.id,
      demo_link: null,
      github_link: null,
      image_url: null
    };

    const result = await updateProject(updateInput);

    // Verify nullable fields were set to null
    expect(result).toBeTruthy();
    expect(result!.demo_link).toBeNull();
    expect(result!.github_link).toBeNull();
    expect(result!.image_url).toBeNull();
    
    // Non-nullable fields should remain unchanged
    expect(result!.title).toEqual('Original Project');
    expect(result!.description).toEqual('Original description');
    expect(result!.technologies).toEqual(['React', 'TypeScript']);
    expect(result!.featured).toBe(false);
  });

  it('should return null when project does not exist', async () => {
    const updateInput: UpdateProjectInput = {
      id: 999, // Non-existent ID
      title: 'Updated Title'
    };

    const result = await updateProject(updateInput);

    expect(result).toBeNull();
  });

  it('should save changes to database', async () => {
    // Create initial project
    const project = await createTestProject();

    const updateInput: UpdateProjectInput = {
      id: project.id,
      title: 'Database Update Test',
      technologies: ['Angular', 'TypeScript']
    };

    await updateProject(updateInput);

    // Verify changes were persisted in database
    const savedProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, project.id))
      .execute();

    expect(savedProject).toHaveLength(1);
    expect(savedProject[0].title).toEqual('Database Update Test');
    expect(savedProject[0].technologies).toEqual(['Angular', 'TypeScript']);
    expect(savedProject[0].description).toEqual('Original description');
    expect(savedProject[0].updated_at).not.toEqual(project.updated_at);
  });

  it('should update technologies array correctly', async () => {
    // Create initial project
    const project = await createTestProject({
      title: 'Tech Test',
      description: 'Testing technologies',
      technologies: ['HTML', 'CSS'],
      featured: false
    });

    const updateInput: UpdateProjectInput = {
      id: project.id,
      technologies: ['Python', 'Django', 'PostgreSQL', 'Docker']
    };

    const result = await updateProject(updateInput);

    expect(result).toBeTruthy();
    expect(result!.technologies).toEqual(['Python', 'Django', 'PostgreSQL', 'Docker']);
    expect(Array.isArray(result!.technologies)).toBe(true);
    expect(result!.technologies).toHaveLength(4);
  });

  it('should always update the updated_at timestamp', async () => {
    // Create initial project
    const project = await createTestProject();
    const originalUpdatedAt = project.updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateProjectInput = {
      id: project.id,
      title: 'Timestamp Test'
    };

    const result = await updateProject(updateInput);

    expect(result).toBeTruthy();
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});

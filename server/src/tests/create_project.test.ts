
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { createProject } from '../handlers/create_project';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateProjectInput = {
  title: 'Test Portfolio Website',
  description: 'A responsive portfolio website built with React and TypeScript',
  technologies: ['React', 'TypeScript', 'Tailwind CSS'],
  demo_link: 'https://example.com/demo',
  github_link: 'https://github.com/user/project',
  image_url: 'https://example.com/image.jpg',
  featured: true
};

// Minimal test input - featured will get default value from Zod
const minimalInput: CreateProjectInput = {
  title: 'Minimal Project',
  description: 'A minimal project for testing',
  technologies: ['JavaScript'],
  featured: false // Include all required fields
};

describe('createProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a project with all fields', async () => {
    const result = await createProject(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Portfolio Website');
    expect(result.description).toEqual(testInput.description);
    expect(result.technologies).toEqual(['React', 'TypeScript', 'Tailwind CSS']);
    expect(result.demo_link).toEqual('https://example.com/demo');
    expect(result.github_link).toEqual('https://github.com/user/project');
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.featured).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a project with minimal fields and apply defaults', async () => {
    const result = await createProject(minimalInput);

    // Basic field validation
    expect(result.title).toEqual('Minimal Project');
    expect(result.description).toEqual('A minimal project for testing');
    expect(result.technologies).toEqual(['JavaScript']);
    expect(result.demo_link).toBeNull();
    expect(result.github_link).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.featured).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save project to database', async () => {
    const result = await createProject(testInput);

    // Query using proper drizzle syntax
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].title).toEqual('Test Portfolio Website');
    expect(projects[0].description).toEqual(testInput.description);
    expect(projects[0].technologies).toEqual(['React', 'TypeScript', 'Tailwind CSS']);
    expect(projects[0].demo_link).toEqual('https://example.com/demo');
    expect(projects[0].github_link).toEqual('https://github.com/user/project');
    expect(projects[0].image_url).toEqual('https://example.com/image.jpg');
    expect(projects[0].featured).toEqual(true);
    expect(projects[0].created_at).toBeInstanceOf(Date);
    expect(projects[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle technologies array correctly', async () => {
    const singleTechInput: CreateProjectInput = {
      title: 'Single Tech Project',
      description: 'Project with single technology',
      technologies: ['Vue.js'],
      featured: false
    };

    const result = await createProject(singleTechInput);

    expect(result.technologies).toEqual(['Vue.js']);
    expect(Array.isArray(result.technologies)).toBe(true);

    // Verify in database
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects[0].technologies).toEqual(['Vue.js']);
    expect(Array.isArray(projects[0].technologies)).toBe(true);
  });

  it('should set correct timestamps', async () => {
    const beforeCreate = new Date();
    const result = await createProject(testInput);
    const afterCreate = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });
});

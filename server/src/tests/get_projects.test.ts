
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { getProjects } from '../handlers/get_projects';

// Test project inputs
const testProject1: CreateProjectInput = {
  title: 'Regular Project',
  description: 'A regular project description',
  technologies: ['JavaScript', 'Node.js'],
  demo_link: 'https://demo.example.com',
  github_link: 'https://github.com/user/project',
  image_url: 'https://example.com/image.jpg',
  featured: false
};

const testProject2: CreateProjectInput = {
  title: 'Featured Project',
  description: 'A featured project description',
  technologies: ['TypeScript', 'React'],
  demo_link: null,
  github_link: 'https://github.com/user/featured',
  image_url: null,
  featured: true
};

const testProject3: CreateProjectInput = {
  title: 'Another Regular Project',
  description: 'Another regular project',
  technologies: ['Python', 'Django'],
  demo_link: 'https://another-demo.com',
  github_link: null,
  image_url: 'https://example.com/image2.jpg',
  featured: false
};

describe('getProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no projects exist', async () => {
    const result = await getProjects();
    expect(result).toEqual([]);
  });

  it('should return all projects with correct data structure', async () => {
    // Insert test projects
    await db.insert(projectsTable)
      .values([testProject1, testProject2, testProject3])
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(3);
    
    // Check first project structure
    const firstProject = result[0];
    expect(firstProject.id).toBeDefined();
    expect(firstProject.title).toBeDefined();
    expect(firstProject.description).toBeDefined();
    expect(Array.isArray(firstProject.technologies)).toBe(true);
    expect(firstProject.created_at).toBeInstanceOf(Date);
    expect(firstProject.updated_at).toBeInstanceOf(Date);
    expect(typeof firstProject.featured).toBe('boolean');
  });

  it('should order featured projects first, then by created_at desc', async () => {
    // Insert projects in specific order to test sorting
    const project1 = await db.insert(projectsTable)
      .values(testProject1) // regular, oldest
      .returning()
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const project2 = await db.insert(projectsTable)
      .values(testProject2) // featured, middle
      .returning()
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    const project3 = await db.insert(projectsTable)
      .values(testProject3) // regular, newest
      .returning()
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(3);
    
    // Featured project should be first
    expect(result[0].featured).toBe(true);
    expect(result[0].title).toBe('Featured Project');
    
    // Regular projects should be ordered by created_at desc (newest first)
    expect(result[1].featured).toBe(false);
    expect(result[1].title).toBe('Another Regular Project'); // newest regular
    
    expect(result[2].featured).toBe(false);
    expect(result[2].title).toBe('Regular Project'); // oldest regular
  });

  it('should handle projects with null optional fields', async () => {
    const projectWithNulls: CreateProjectInput = {
      title: 'Minimal Project',
      description: 'A project with minimal info',
      technologies: ['HTML', 'CSS'],
      demo_link: null,
      github_link: null,
      image_url: null,
      featured: false
    };

    await db.insert(projectsTable)
      .values(projectWithNulls)
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Minimal Project');
    expect(result[0].demo_link).toBeNull();
    expect(result[0].github_link).toBeNull();
    expect(result[0].image_url).toBeNull();
    expect(result[0].technologies).toEqual(['HTML', 'CSS']);
  });

  it('should preserve technologies array data type', async () => {
    await db.insert(projectsTable)
      .values(testProject1)
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    expect(Array.isArray(result[0].technologies)).toBe(true);
    expect(result[0].technologies).toEqual(['JavaScript', 'Node.js']);
    expect(typeof result[0].technologies[0]).toBe('string');
  });
});

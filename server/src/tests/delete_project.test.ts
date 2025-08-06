
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { deleteProject } from '../handlers/delete_project';

describe('deleteProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing project and return true', async () => {
    // Create a test project first
    const testProject = await db.insert(projectsTable)
      .values({
        title: 'Test Project',
        description: 'A test project for deletion',
        technologies: ['JavaScript', 'React'],
        featured: false
      })
      .returning()
      .execute();

    const projectId = testProject[0].id;

    // Delete the project
    const result = await deleteProject(projectId);

    expect(result).toBe(true);

    // Verify the project is actually deleted
    const deletedProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    expect(deletedProject).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent project', async () => {
    // Try to delete a project that doesn't exist
    const result = await deleteProject(99999);

    expect(result).toBe(false);
  });

  it('should not affect other projects when deleting one', async () => {
    // Create multiple test projects
    const projects = await db.insert(projectsTable)
      .values([
        {
          title: 'Project 1',
          description: 'First project',
          technologies: ['JavaScript'],
          featured: false
        },
        {
          title: 'Project 2', 
          description: 'Second project',
          technologies: ['Python'],
          featured: true
        }
      ])
      .returning()
      .execute();

    const firstProjectId = projects[0].id;
    const secondProjectId = projects[1].id;

    // Delete the first project
    const result = await deleteProject(firstProjectId);

    expect(result).toBe(true);

    // Verify first project is deleted
    const deletedProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, firstProjectId))
      .execute();

    expect(deletedProject).toHaveLength(0);

    // Verify second project still exists
    const remainingProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, secondProjectId))
      .execute();

    expect(remainingProject).toHaveLength(1);
    expect(remainingProject[0].title).toEqual('Project 2');
  });
});

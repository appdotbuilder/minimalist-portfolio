
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Project } from '../schema';

export const getProjectById = async (id: number): Promise<Project | null> => {
  try {
    const results = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const project = results[0];
    return {
      ...project,
      technologies: project.technologies as string[] // JSON field - cast to proper type
    };
  } catch (error) {
    console.error('Failed to get project by ID:', error);
    throw error;
  }
};

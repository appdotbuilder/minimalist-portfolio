
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type Project } from '../schema';
import { desc } from 'drizzle-orm';

export async function getProjects(): Promise<Project[]> {
  try {
    const results = await db.select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.featured), desc(projectsTable.created_at))
      .execute();

    return results.map(project => ({
      ...project,
      // Ensure technologies is properly typed as string array
      technologies: project.technologies as string[]
    }));
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
}

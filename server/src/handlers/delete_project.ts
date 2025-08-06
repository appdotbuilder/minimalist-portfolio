
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteProject(id: number): Promise<boolean> {
  try {
    const result = await db.delete(projectsTable)
      .where(eq(projectsTable.id, id))
      .returning()
      .execute();

    // Return true if a project was deleted, false if no project found
    return result.length > 0;
  } catch (error) {
    console.error('Project deletion failed:', error);
    throw error;
  }
}

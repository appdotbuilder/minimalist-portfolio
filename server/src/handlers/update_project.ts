
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput, type Project } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateProject(input: UpdateProjectInput): Promise<Project | null> {
  try {
    // Extract id from input for the where clause
    const { id, ...updateData } = input;

    // Build update object only with provided fields
    const updateValues: any = {};
    
    if (updateData.title !== undefined) {
      updateValues.title = updateData.title;
    }
    
    if (updateData.description !== undefined) {
      updateValues.description = updateData.description;
    }
    
    if (updateData.technologies !== undefined) {
      updateValues.technologies = updateData.technologies;
    }
    
    if (updateData.demo_link !== undefined) {
      updateValues.demo_link = updateData.demo_link;
    }
    
    if (updateData.github_link !== undefined) {
      updateValues.github_link = updateData.github_link;
    }
    
    if (updateData.image_url !== undefined) {
      updateValues.image_url = updateData.image_url;
    }
    
    if (updateData.featured !== undefined) {
      updateValues.featured = updateData.featured;
    }

    // Always update the updated_at timestamp
    updateValues.updated_at = new Date();

    // Perform the update
    const result = await db.update(projectsTable)
      .set(updateValues)
      .where(eq(projectsTable.id, id))
      .returning()
      .execute();

    // Return the updated project or null if not found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Project update failed:', error);
    throw error;
  }
}


import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput, type Project } from '../schema';

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  try {
    // Insert project record
    const result = await db.insert(projectsTable)
      .values({
        title: input.title,
        description: input.description,
        technologies: input.technologies,
        demo_link: input.demo_link || null,
        github_link: input.github_link || null,
        image_url: input.image_url || null,
        featured: input.featured // Zod default is applied, so this is always defined
      })
      .returning()
      .execute();

    const project = result[0];
    return {
      ...project,
      technologies: project.technologies || [] // Ensure technologies is always an array
    };
  } catch (error) {
    console.error('Project creation failed:', error);
    throw error;
  }
};

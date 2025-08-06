
import { z } from 'zod';

// Project schema
export const projectSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  technologies: z.array(z.string()), // Array of technology names
  demo_link: z.string().nullable(), // Can be null if no demo available
  github_link: z.string().nullable(), // Can be null if no GitHub repo
  image_url: z.string().nullable(), // Optional project image
  featured: z.boolean(), // Whether to highlight this project
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Project = z.infer<typeof projectSchema>;

// Input schema for creating projects
export const createProjectInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  demo_link: z.string().url().nullable().optional(),
  github_link: z.string().url().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  featured: z.boolean().default(false)
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

// Input schema for updating projects
export const updateProjectInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  technologies: z.array(z.string()).min(1).optional(),
  demo_link: z.string().url().nullable().optional(),
  github_link: z.string().url().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  featured: z.boolean().optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

// Skill schema
export const skillSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(), // e.g., "Frontend", "Backend", "Tools", etc.
  proficiency_level: z.number().min(1).max(5), // 1-5 scale
  created_at: z.coerce.date()
});

export type Skill = z.infer<typeof skillSchema>;

// Input schema for creating skills
export const createSkillInputSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: z.string().min(1, "Category is required"),
  proficiency_level: z.number().min(1).max(5)
});

export type CreateSkillInput = z.infer<typeof createSkillInputSchema>;

// Input schema for updating skills
export const updateSkillInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  proficiency_level: z.number().min(1).max(5).optional()
});

export type UpdateSkillInput = z.infer<typeof updateSkillInputSchema>;

// Contact message schema
export const contactMessageSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  subject: z.string(),
  message: z.string(),
  created_at: z.coerce.date()
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

// Input schema for creating contact messages
export const createContactMessageInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required")
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageInputSchema>;

// Profile/About Me schema
export const profileSchema = z.object({
  id: z.number(),
  name: z.string(),
  title: z.string(), // Professional title
  bio: z.string(),
  location: z.string().nullable(),
  email: z.string(),
  phone: z.string().nullable(),
  linkedin_url: z.string().nullable(),
  github_url: z.string().nullable(),
  twitter_url: z.string().nullable(),
  website_url: z.string().nullable(),
  avatar_url: z.string().nullable(),
  resume_url: z.string().nullable(),
  updated_at: z.coerce.date()
});

export type Profile = z.infer<typeof profileSchema>;

// Input schema for updating profile
export const updateProfileInputSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  bio: z.string().min(1).optional(),
  location: z.string().nullable().optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  github_url: z.string().url().nullable().optional(),
  twitter_url: z.string().url().nullable().optional(),
  website_url: z.string().url().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  resume_url: z.string().url().nullable().optional()
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

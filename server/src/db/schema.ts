
import { serial, text, pgTable, timestamp, boolean, integer, json } from 'drizzle-orm/pg-core';

export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  technologies: json('technologies').$type<string[]>().notNull(), // Store as JSON array
  demo_link: text('demo_link'), // Nullable by default
  github_link: text('github_link'), // Nullable by default
  image_url: text('image_url'), // Nullable by default
  featured: boolean('featured').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const skillsTable = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  proficiency_level: integer('proficiency_level').notNull(), // 1-5 scale
  created_at: timestamp('created_at').defaultNow().notNull()
});

export const contactMessagesTable = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

export const profileTable = pgTable('profile', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title').notNull(), // Professional title
  bio: text('bio').notNull(),
  location: text('location'), // Nullable
  email: text('email').notNull(),
  phone: text('phone'), // Nullable
  linkedin_url: text('linkedin_url'), // Nullable
  github_url: text('github_url'), // Nullable
  twitter_url: text('twitter_url'), // Nullable
  website_url: text('website_url'), // Nullable
  avatar_url: text('avatar_url'), // Nullable
  resume_url: text('resume_url'), // Nullable
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schemas
export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;

export type Skill = typeof skillsTable.$inferSelect;
export type NewSkill = typeof skillsTable.$inferInsert;

export type ContactMessage = typeof contactMessagesTable.$inferSelect;
export type NewContactMessage = typeof contactMessagesTable.$inferInsert;

export type Profile = typeof profileTable.$inferSelect;
export type NewProfile = typeof profileTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  projects: projectsTable,
  skills: skillsTable,
  contactMessages: contactMessagesTable,
  profile: profileTable
};

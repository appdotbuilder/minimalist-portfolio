
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createProjectInputSchema,
  updateProjectInputSchema,
  createSkillInputSchema,
  updateSkillInputSchema,
  createContactMessageInputSchema,
  updateProfileInputSchema
} from './schema';

// Import handlers
import { createProject } from './handlers/create_project';
import { getProjects } from './handlers/get_projects';
import { getProjectById } from './handlers/get_project_by_id';
import { updateProject } from './handlers/update_project';
import { deleteProject } from './handlers/delete_project';
import { createSkill } from './handlers/create_skill';
import { getSkills } from './handlers/get_skills';
import { updateSkill } from './handlers/update_skill';
import { deleteSkill } from './handlers/delete_skill';
import { createContactMessage } from './handlers/create_contact_message';
import { getContactMessages } from './handlers/get_contact_messages';
import { getProfile } from './handlers/get_profile';
import { updateProfile } from './handlers/update_profile';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Project routes
  createProject: publicProcedure
    .input(createProjectInputSchema)
    .mutation(({ input }) => createProject(input)),
  
  getProjects: publicProcedure
    .query(() => getProjects()),
  
  getProjectById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getProjectById(input.id)),
  
  updateProject: publicProcedure
    .input(updateProjectInputSchema)
    .mutation(({ input }) => updateProject(input)),
  
  deleteProject: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteProject(input.id)),

  // Skill routes
  createSkill: publicProcedure
    .input(createSkillInputSchema)
    .mutation(({ input }) => createSkill(input)),
  
  getSkills: publicProcedure
    .query(() => getSkills()),
  
  updateSkill: publicProcedure
    .input(updateSkillInputSchema)
    .mutation(({ input }) => updateSkill(input)),
  
  deleteSkill: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteSkill(input.id)),

  // Contact routes
  createContactMessage: publicProcedure
    .input(createContactMessageInputSchema)
    .mutation(({ input }) => createContactMessage(input)),
  
  getContactMessages: publicProcedure
    .query(() => getContactMessages()),

  // Profile routes
  getProfile: publicProcedure
    .query(() => getProfile()),
  
  updateProfile: publicProcedure
    .input(updateProfileInputSchema)
    .mutation(({ input }) => updateProfile(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();


import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Moon, 
  Sun, 
  Github, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Twitter,
  Plus,
  Edit,
  Trash2,
  Star,
  Code,
  Briefcase,
  User,
  MessageSquare
} from 'lucide-react';
import type { Project, Skill, Profile, ContactMessage } from '../../server/src/schema';
import { ProjectDialog } from '@/components/ProjectDialog';
import { SkillDialog } from '@/components/SkillDialog';
import { ContactForm } from '@/components/ContactForm';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [activeSection, setActiveSection] = useState('about');
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // Load data functions
  const loadProjects = useCallback(async () => {
    try {
      const result = await trpc.getProjects.query();
      setProjects(result);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }, []);

  const loadSkills = useCallback(async () => {
    try {
      const result = await trpc.getSkills.query();
      setSkills(result);
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const result = await trpc.getProfile.query();
      setProfile(result);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }, []);

  const loadContactMessages = useCallback(async () => {
    try {
      const result = await trpc.getContactMessages.query();
      setContactMessages(result);
    } catch (error) {
      console.error('Failed to load contact messages:', error);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    loadSkills();
    loadProfile();
    loadContactMessages();
  }, [loadProjects, loadSkills, loadProfile, loadContactMessages]);

  useEffect(() => {
    // Apply dark mode to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      await trpc.deleteProject.mutate({ id: projectId });
      setProjects((prev: Project[]) => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await trpc.deleteSkill.mutate({ id: skillId });
      setSkills((prev: Skill[]) => prev.filter(s => s.id !== skillId));
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Featured projects
  const featuredProjects = projects.filter(p => p.featured);
  const regularProjects = projects.filter(p => !p.featured);

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900'
    }`}>
      {/* Navigation */}
      <nav className={`fixed top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${
        isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'
      } border-b`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {profile?.name || 'Portfolio'}
            </div>
            
            <div className="flex items-center space-x-6">
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className={`${
                  isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <TabsTrigger value="about" className="flex items-center gap-2">
                    <User size={16} />
                    About
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="flex items-center gap-2">
                    <Code size={16} />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="flex items-center gap-2">
                    <Briefcase size={16} />
                    Skills
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    Contact
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full"
              >
                <div className="transition-transform duration-300">
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          
          {/* About Section */}
          <TabsContent value="about" className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <Avatar className="w-32 h-32 mx-auto mb-8 ring-4 ring-blue-500/20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-2xl">
                    {profile?.name?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {profile?.name || 'Your Name'}
                </h1>
                
                <p className={`text-xl mb-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {profile?.title || 'Software Developer'}
                </p>
                
                <div className={`prose prose-lg mx-auto ${isDarkMode ? 'prose-invert' : ''}`}>
                  <p>{profile?.bio || 'Passionate developer creating amazing digital experiences.'}</p>
                </div>
              </div>

              {profile && (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50'} backdrop-blur-sm`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="text-blue-500" size={20} />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profile.email && (
                          <div className="flex items-center gap-3">
                            <Mail size={18} className="text-slate-400" />
                            <span>{profile.email}</span>
                          </div>
                        )}
                        {profile.phone && (
                          <div className="flex items-center gap-3">
                            <Phone size={18} className="text-slate-400" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                        {profile.location && (
                          <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-slate-400" />
                            <span>{profile.location}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50'} backdrop-blur-sm`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ExternalLink className="text-blue-500" size={20} />
                          Links
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profile.github_url && (
                          <a href={profile.github_url} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center gap-3 hover:text-blue-400 transition-colors">
                            <Github size={18} />
                            <span>GitHub</span>
                          </a>
                        )}
                        {profile.linkedin_url && (
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center gap-3 hover:text-blue-400 transition-colors">
                            <Linkedin size={18} />
                            <span>LinkedIn</span>
                          </a>
                        )}
                        {profile.twitter_url && (
                          <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center gap-3 hover:text-blue-400 transition-colors">
                            <Twitter size={18} />
                            <span>Twitter</span>
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Projects Section */}
          <TabsContent value="projects" className="container mx-auto px-6">
            <div>
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  My Projects ✨
                </h2>
                <div>
                  <Button 
                    onClick={() => {
                      setEditingProject(null);
                      setIsProjectDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Plus size={18} className="mr-2" />
                    Add Project
                  </Button>
                </div>
              </div>

              {/* Featured Projects */}
              {featuredProjects.length > 0 && (
                <div className="mb-12">
                  <h3 className={`text-2xl font-semibold mb-6 flex items-center gap-2 ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    <Star size={24} />
                    Featured Projects
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {featuredProjects.map((project: Project) => (
                      <ProjectCard 
                        key={project.id} 
                        project={project}
                        isDarkMode={isDarkMode}
                        onEdit={() => {
                          setEditingProject(project);
                          setIsProjectDialogOpen(true);
                        }}
                        onDelete={() => handleDeleteProject(project.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Projects */}
              {regularProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularProjects.map((project: Project) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project}
                      isDarkMode={isDarkMode}
                      onEdit={() => {
                        setEditingProject(project);
                        setIsProjectDialogOpen(true);
                      }}
                      onDelete={() => handleDeleteProject(project.id)}
                    />
                  ))}
                </div>
              ) : featuredProjects.length === 0 ? (
                <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Code size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xl">No projects yet. Start by adding your first project! 🚀</p>
                </div>
              ) : null}
            </div>
          </TabsContent>

          {/* Skills Section */}
          <TabsContent value="skills" className="container mx-auto px-6">
            <div>
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Skills & Expertise 🛠️
                </h2>
                <div>
                  <Button 
                    onClick={() => {
                      setEditingSkill(null);
                      setIsSkillDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Plus size={18} className="mr-2" />
                    Add Skill
                  </Button>
                </div>
              </div>

              {Object.keys(skillsByCategory).length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                    <div key={category}>
                      <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50'} backdrop-blur-sm`}>
                        <CardHeader>
                          <CardTitle className="text-xl">{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {(categorySkills as Skill[]).map((skill: Skill) => (
                              <SkillItem
                                key={skill.id}
                                skill={skill}
                                isDarkMode={isDarkMode}
                                onEdit={() => {
                                  setEditingSkill(skill);
                                  setIsSkillDialogOpen(true);
                                }}
                                onDelete={() => handleDeleteSkill(skill.id)}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xl">No skills added yet. Showcase your expertise! 💪</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Contact Section */}
          <TabsContent value="contact" className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-12 text-center">
                Get In Touch 💬
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <ContactForm isDarkMode={isDarkMode} onMessageSent={loadContactMessages} />
                </div>

                <div className="space-y-6">
                  <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50'} backdrop-blur-sm`}>
                    <CardHeader>
                      <CardTitle>Let's Connect! 🤝</CardTitle>
                      <CardDescription>
                        I'm always interested in new opportunities and collaborations.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile?.email && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-500/20">
                            <Mail size={18} className="text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">Email</p>
                            <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{profile.email}</p>
                          </div>
                        </div>
                      )}
                      
                      {profile?.phone && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-500/20">
                            <Phone size={18} className="text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{profile.phone}</p>
                          </div>
                        </div>
                      )}

                      {profile?.location && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-purple-500/20">
                            <MapPin size={18} className="text-purple-500" />
                          </div>
                          <div>
                            <p className="font-medium">Location</p>
                            <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{profile.location}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Messages */}
                  {contactMessages.length > 0 && (
                    <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50'} backdrop-blur-sm`}>
                      <CardHeader>
                        <CardTitle className="text-lg">Recent Messages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {contactMessages.slice(0, 3).map((message: ContactMessage) => (
                            <div key={message.id} className={`p-3 rounded-lg ${
                              isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'
                            }`}>
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium">{message.name}</p>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {message.created_at.toLocaleDateString()}
                                </p>
                              </div>
                              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                {message.subject}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <ProjectDialog
        isOpen={isProjectDialogOpen}
        onClose={() => {
          setIsProjectDialogOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        isDarkMode={isDarkMode}
        onProjectSaved={loadProjects}
      />

      <SkillDialog
        isOpen={isSkillDialogOpen}
        onClose={() => {
          setIsSkillDialogOpen(false);
          setEditingSkill(null);
        }}
        skill={editingSkill}
        isDarkMode={isDarkMode}
        onSkillSaved={loadSkills}
      />
    </div>
  );
}

// Project Card Component
interface ProjectCardProps {
  project: Project;
  isDarkMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function ProjectCard({ project, isDarkMode, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div>
      <Card className={`group h-full transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        isDarkMode 
          ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70' 
          : 'bg-white/50 hover:bg-white/70'
      } backdrop-blur-sm`}>
        {project.image_url && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img 
              src={project.image_url} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}
        
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl">{project.title}</CardTitle>
                {project.featured && (
                  <Star size={16} className="text-yellow-400 fill-current" />
                )}
              </div>
              <CardDescription className="text-sm">
                {project.description}
              </CardDescription>
            </div>
            <div className="flex gap-1 ml-2">
              <Button variant="ghost" size="icon" onClick={onEdit} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500">
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech: string) => (
              <Badge 
                key={tech} 
                variant="secondary" 
                className={`${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}
              >
                {tech}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2 pt-2">
            {project.demo_link && (
              <Button variant="outline" size="sm" asChild>
                <a href={project.demo_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} className="mr-2" />
                  Demo
                </a>
              </Button>
            )}
            {project.github_link && (
              <Button variant="outline" size="sm" asChild>
                <a href={project.github_link} target="_blank" rel="noopener noreferrer">
                  <Github size={16} className="mr-2" />
                  Code
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Skill Item Component
interface SkillItemProps {
  skill: Skill;
  isDarkMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SkillItem({ skill, isDarkMode, onEdit, onDelete }: SkillItemProps) {
  return (
    <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/20 transition-colors">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{skill.name}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
              <Edit size={14} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500 h-8 w-8">
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={skill.proficiency_level * 20} className="flex-1" />
          <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {skill.proficiency_level}/5
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;

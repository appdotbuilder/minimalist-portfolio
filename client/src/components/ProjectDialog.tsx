
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../../../server/src/schema';

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  isDarkMode: boolean;
  onProjectSaved: () => void;
}

export function ProjectDialog({ isOpen, onClose, project, isDarkMode, onProjectSaved }: ProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [techInput, setTechInput] = useState('');
  
  const [formData, setFormData] = useState<CreateProjectInput>({
    title: '',
    description: '',
    technologies: [],
    demo_link: null,
    github_link: null,
    image_url: null,
    featured: false
  });

  // Reset form when dialog opens/closes or project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        // Editing existing project
        setFormData({
          title: project.title,
          description: project.description,
          technologies: project.technologies,
          demo_link: project.demo_link,
          github_link: project.github_link,
          image_url: project.image_url,
          featured: project.featured
        });
      } else {
        // Creating new project
        setFormData({
          title: '',
          description: '',
          technologies: [],
          demo_link: null,
          github_link: null,
          image_url: null,
          featured: false
        });
      }
      setTechInput('');
    }
  }, [isOpen, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (project) {
        // Update existing project
        const updateData: UpdateProjectInput = {
          id: project.id,
          ...formData
        };
        await trpc.updateProject.mutate(updateData);
      } else {
        // Create new project
        await trpc.createProject.mutate(formData);
      }
      
      onProjectSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev: CreateProjectInput) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (techToRemove: string) => {
    setFormData((prev: CreateProjectInput) => ({
      ...prev,
      technologies: prev.technologies.filter(tech => tech !== techToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTechnology();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {project ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProjectInput) => ({ ...prev, title: e.target.value }))
                }
                placeholder="My Awesome Project"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev: CreateProjectInput) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe your project..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="demo_link">Demo Link (Optional)</Label>
              <Input
                id="demo_link"
                type="url"
                value={formData.demo_link || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProjectInput) => ({
                    ...prev,
                    demo_link: e.target.value || null
                  }))
                }
                placeholder="https://demo.example.com"
              />
            </div>

            <div>
              <Label htmlFor="github_link">GitHub Link (Optional)</Label>
              <Input
                id="github_link"
                type="url"
                value={formData.github_link || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProjectInput) => ({
                    ...prev,
                    github_link: e.target.value || null
                  }))
                }
                placeholder="https://github.com/user/repo"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="image_url">Project Image URL (Optional)</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProjectInput) => ({
                    ...prev,
                    image_url: e.target.value || null
                  }))
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="col-span-2">
              <Label>Technologies Used</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={techInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTechInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add technology..."
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTechnology} size="icon">
                  <Plus size={16} />
                </Button>
              </div>
              
              {formData.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.technologies.map((tech: string) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tech}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveTechnology(tech)}
                      >
                        <X size={12} />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked: boolean) =>
                    setFormData((prev: CreateProjectInput) => ({ ...prev, featured: checked }))
                  }
                />
                <Label htmlFor="featured">Featured Project</Label>
              </div>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Featured projects will be highlighted and shown first
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title || !formData.description || formData.technologies.length === 0}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isLoading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

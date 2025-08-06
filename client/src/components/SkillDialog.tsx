
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { trpc } from '@/utils/trpc';
import type { Skill, CreateSkillInput, UpdateSkillInput } from '../../../server/src/schema';

interface SkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  skill?: Skill | null;
  isDarkMode: boolean;
  onSkillSaved: () => void;
}

export function SkillDialog({ isOpen, onClose, skill, isDarkMode, onSkillSaved }: SkillDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateSkillInput>({
    name: '',
    category: '',
    proficiency_level: 3
  });

  // Common skill categories
  const skillCategories = [
    'Frontend',
    'Backend',
    'Database',
    'DevOps',
    'Tools',
    'Languages',
    'Frameworks',
    'Cloud',
    'Mobile',
    'Design'
  ];

  // Reset form when dialog opens/closes or skill changes
  useEffect(() => {
    if (isOpen) {
      if (skill) {
        // Editing existing skill
        setFormData({
          name: skill.name,
          category: skill.category,
          proficiency_level: skill.proficiency_level
        });
      } else {
        // Creating new skill
        setFormData({
          name: '',
          category: '',
          proficiency_level: 3
        });
      }
    }
  }, [isOpen, skill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (skill) {
        // Update existing skill
        const updateData: UpdateSkillInput = {
          id: skill.id,
          ...formData
        };
        await trpc.updateSkill.mutate(updateData);
      } else {
        // Create new skill
        await trpc.createSkill.mutate(formData);
      }
      
      onSkillSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save skill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProficiencyLabel = (level: number) => {
    const labels = {
      1: 'Beginner',
      2: 'Basic',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return labels[level as keyof typeof labels];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-lg ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {skill ? 'Edit Skill' : 'Add New Skill'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            
            <Label htmlFor="name">Skill Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateSkillInput) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., React, Python, AWS..."
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category || ''}
              onValueChange={(value: string) =>
                setFormData((prev: CreateSkillInput) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {skillCategories.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="proficiency">
              Proficiency Level: {getProficiencyLabel(formData.proficiency_level)} ({formData.proficiency_level}/5)
            </Label>
            <div className="mt-3">
              <Slider
                value={[formData.proficiency_level]}
                onValueChange={(values: number[]) =>
                  setFormData((prev: CreateSkillInput) => ({ ...prev, proficiency_level: values[0] }))
                }
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>Beginner</span>
                <span>Basic</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Expert</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.category}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isLoading ? 'Saving...' : skill ? 'Update Skill' : 'Add Skill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

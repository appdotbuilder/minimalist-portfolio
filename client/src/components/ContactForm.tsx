
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, CheckCircle } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { CreateContactMessageInput } from '../../../server/src/schema';

interface ContactFormProps {
  isDarkMode: boolean;
  onMessageSent: () => void;
}

export function ContactForm({ isDarkMode, onMessageSent }: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState<CreateContactMessageInput>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await trpc.createContactMessage.mutate(formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      setIsSuccess(true);
      onMessageSent();
      
      // Hide success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50'} backdrop-blur-sm`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Message Sent! 🎉</h3>
          <p className={`text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Thank you for reaching out. I'll get back to you soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50'} backdrop-blur-sm`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="text-blue-500" size={20} />
          Send me a message
        </CardTitle>
        <CardDescription>
          I'd love to hear from you. Send me a message and I'll respond as soon as possible.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateContactMessageInput) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Your name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateContactMessageInput) => ({ ...prev, email: e.target.value }))
                }
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateContactMessageInput) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="What's this about?"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreateContactMessageInput) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Your message..."
              rows={4}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

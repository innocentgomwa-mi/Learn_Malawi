import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TeacherDiscussions() {
  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Discussions / Q&A</h1>
          <p className="text-muted-foreground text-sm mt-1">Answer student questions and moderate threads</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> New Thread</Button>
      </div>
      <div className="text-center py-24 text-muted-foreground">
        <MessageSquare className="w-14 h-14 mx-auto mb-4 opacity-25" />
        <p className="font-medium">No discussions yet</p>
        <p className="text-sm mt-1">Student questions and discussion threads will appear here</p>
      </div>
    </div>
  );
}
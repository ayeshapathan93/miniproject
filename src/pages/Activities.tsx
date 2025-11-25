import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Activity {
  id: string;
  title: string;
  description: string;
  due_date: string;
  subjects: { name: string };
}

interface Subject {
  id: string;
  name: string;
}

const Activities = () => {
  const { profile, user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    subject_id: "",
    due_date: ""
  });

  useEffect(() => {
    fetchActivities();
    fetchSubjects();
  }, []);

  const fetchActivities = async () => {
    const { data } = await supabase
      .from('activities')
      .select('*, subjects(name)')
      .order('due_date', { ascending: true });

    if (data) {
      setActivities(data);
    }
  };

  const fetchSubjects = async () => {
    const { data } = await supabase
      .from('subjects')
      .select('id, name')
      .order('name');

    if (data) {
      setSubjects(data);
    }
  };

  const handleCreateActivity = async () => {
    if (!newActivity.title.trim() || !newActivity.subject_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { error } = await supabase
      .from('activities')
      .insert([{
        ...newActivity,
        created_by: user?.id
      }]);

    if (error) {
      toast.error("Failed to create activity");
    } else {
      toast.success("Activity created successfully");
      setDialogOpen(false);
      setNewActivity({ title: "", description: "", subject_id: "", due_date: "" });
      fetchActivities();
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activities</h1>
          <p className="text-muted-foreground">Manage assignments and tasks</p>
        </div>
        {profile?.role === "teacher" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Activity</DialogTitle>
                <DialogDescription>Add a new assignment or task</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    placeholder="e.g., Chapter 5 Assignment"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={newActivity.subject_id}
                    onValueChange={(value) => setNewActivity({ ...newActivity, subject_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newActivity.due_date}
                    onChange={(e) => setNewActivity({ ...newActivity, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Activity details and instructions"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateActivity}>Create Activity</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="shadow-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    {activity.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{activity.subjects?.name}</Badge>
                    {activity.due_date && (
                      <Badge variant={isOverdue(activity.due_date) ? "destructive" : "secondary"}>
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(activity.due_date).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <CardDescription>
                {activity.description || "No description provided"}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}

        {activities.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No activities available yet.
                {profile?.role === "teacher" && " Click 'Create Activity' to get started."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Activities;

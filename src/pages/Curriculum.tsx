// import { useEffect, useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
// import { BookOpen, Plus } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { supabase } from "@/integrations/supabase/client";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "sonner";

// interface Subject {
//   id: string;
//   name: string;
//   description: string;
//   grade_level: string;
//   progress?: number;
// }

// const Curriculum = () => {
//   const { profile, user } = useAuth();
//   const [subjects, setSubjects] = useState<Subject[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [newSubject, setNewSubject] = useState({ name: "", description: "", grade_level: "" });

//   useEffect(() => {
//     fetchSubjects();
//   }, [profile]);

//   const fetchSubjects = async () => {
//     const { data: subjectsData } = await supabase
//       .from('subjects')
//       .select('*')
//       .order('created_at', { ascending: false });

//     if (subjectsData && user) {
//       // Fetch progress for each subject
//       const { data: progressData } = await supabase
//         .from('curriculum_progress')
//         .select('subject_id, progress_percentage')
//         .eq('student_id', user.id);

//       const progressMap = new Map(
//         progressData?.map(p => [p.subject_id, p.progress_percentage]) || []
//       );

//       const subjectsWithProgress = subjectsData.map(subject => ({
//         ...subject,
//         progress: progressMap.get(subject.id) || 0
//       }));

//       setSubjects(subjectsWithProgress);
//     }

//     setLoading(false);
//   };

//   const handleCreateSubject = async () => {
//     if (!newSubject.name.trim()) {
//       toast.error("Please enter a subject name");
//       return;
//     }

//     const { error } = await supabase
//       .from('subjects')
//       .insert([newSubject]);

//     if (error) {
//       toast.error("Failed to create subject");
//     } else {
//       toast.success("Subject created successfully");
//       setDialogOpen(false);
//       setNewSubject({ name: "", description: "", grade_level: "" });
//       fetchSubjects();
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Curriculum</h1>
//           <p className="text-muted-foreground">Manage subjects and track progress</p>
//         </div>
//         {profile?.role === "teacher" && (
//           <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <Plus className="h-4 w-4" />
//                 Add Subject
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Create New Subject</DialogTitle>
//                 <DialogDescription>Add a new subject to the curriculum</DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4 py-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="name">Subject Name</Label>
//                   <Input
//                     id="name"
//                     value={newSubject.name}
//                     onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
//                     placeholder="e.g., Mathematics"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="grade">Grade Level</Label>
//                   <Input
//                     id="grade"
//                     value={newSubject.grade_level}
//                     onChange={(e) => setNewSubject({ ...newSubject, grade_level: e.target.value })}
//                     placeholder="e.g., Grade 10"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="description">Description</Label>
//                   <Textarea
//                     id="description"
//                     value={newSubject.description}
//                     onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
//                     placeholder="Brief description of the subject"
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button onClick={handleCreateSubject}>Create Subject</Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         )}
//       </div>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {subjects.map((subject) => (
//           <Card key={subject.id} className="shadow-card hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="flex items-start justify-between">
//                 <div className="space-y-1">
//                   <CardTitle className="flex items-center gap-2">
//                     <BookOpen className="h-5 w-5 text-primary" />
//                     {subject.name}
//                   </CardTitle>
//                   {subject.grade_level && (
//                     <Badge variant="outline">{subject.grade_level}</Badge>
//                   )}
//                 </div>
//               </div>
//               <CardDescription className="line-clamp-2">
//                 {subject.description || "No description available"}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               <div className="space-y-1">
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-muted-foreground">Progress</span>
//                   <span className="font-medium">{subject.progress}%</span>
//                 </div>
//                 <Progress value={subject.progress} className="h-2" />
//               </div>
//             </CardContent>
//           </Card>
//         ))}

//         {subjects.length === 0 && !loading && (
//           <Card className="col-span-full shadow-card">
//             <CardContent className="flex flex-col items-center justify-center py-10">
//               <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
//               <p className="text-muted-foreground text-center">
//                 No subjects available yet.
//                 {profile?.role === "teacher" && " Click 'Add Subject' to get started."}
//               </p>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Curriculum;




"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  description: string;
  grade_level: string;
  progress?: number;
}

const CurriculumPage = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: "",
    grade_level: "",
    description: "",
  });

  useEffect(() => {
    if (user) fetchSubjects();
  }, [user]);

  const fetchSubjects = async () => {
    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch student progress
    const { data: progressData } = await supabase
      .from("curriculum_progress")
      .select("subject_id, progress_percentage")
      .eq("student_id", user?.id);

    const progressMap = new Map(
      progressData?.map((p) => [p.subject_id, p.progress_percentage]) || []
    );

    const subjectsWithProgress = subjectsData?.map((s) => ({
      ...s,
      progress: progressMap.get(s.id) || 0,
    })) || [];

    setSubjects(subjectsWithProgress);
    setLoading(false);
  };

  const createSubject = async () => {
    if (!newSubject.name.trim()) {
      toast.error("Please enter a subject name");
      return;
    }

    const { error } = await supabase.from("subjects").insert([newSubject]);
    if (error) {
      toast.error("Failed to create subject");
      return;
    }

    toast.success("Subject created successfully");
    setDialogOpen(false);
    setNewSubject({ name: "", grade_level: "", description: "" });
    fetchSubjects();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Curriculum</h1>
          <p className="text-muted-foreground">Manage subjects and track progress</p>
        </div>

        {/* Teacher Only: Add Subject */}
        {profile?.role === "teacher" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={18} /> Add Subject
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Subject</DialogTitle>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <Input
                  placeholder="Subject Name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                />
                <Input
                  placeholder="Grade Level"
                  value={newSubject.grade_level}
                  onChange={(e) => setNewSubject({ ...newSubject, grade_level: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button onClick={createSubject}>Create Subject</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Subjects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card
            key={subject.id}
            onClick={() => navigate(`/subject/${subject.id}`)}
            className="cursor-pointer hover:shadow-lg transition"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-primary" size={20} />
                {subject.name}
              </CardTitle>

              {subject.grade_level && <Badge variant="outline">{subject.grade_level}</Badge>}

              <CardDescription>{subject.description || "No description available"}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="text-sm flex justify-between mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span>{subject.progress}%</span>
              </div>
              <Progress value={subject.progress} />
            </CardContent>
          </Card>
        ))}

        {!loading && subjects.length === 0 && (
          <Card className="col-span-full p-10 flex justify-center">
            <p className="text-muted-foreground text-center">
              No subjects available yet.
              {profile?.role === "teacher" && " Click 'Add Subject' to get started."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CurriculumPage;

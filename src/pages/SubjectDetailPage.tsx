"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  description: string;
  grade_level: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_marks: number;
  subject_id: string;
  created_at?: string;
}

interface AssignmentProgress {
  assignment_id: string;
  student_id: string;
  status: "pending" | "submitted" | "graded";
  marks?: number;
  teacher_viewed?: boolean;
  created_at?: string;
}

const SubjectDetailPage = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const { subjectId } = useParams<{ subjectId: string }>();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<AssignmentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subjectId) fetchData();
  }, [subjectId]);

  const fetchData = async () => {
    setLoading(true);

    const { data: subjectData } = (await supabase
      .from("subjects")
      .select("*")
      .eq("id", subjectId)
      .single()) as { data: Subject | null; error: any };

    const { data: assignmentsData } = (await (supabase as any)
      .from("assignments")
      .select("*")
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: true })) as { data: Assignment[] | null; error: any };

    const { data: progressData } = await (supabase as any)
      .from("assignment_progress")
      .select("*")
      .eq("student_id", user?.id);

    setSubject(subjectData || null);
    setAssignments(assignmentsData || []);
    setProgress(progressData || []);
    setLoading(false);
  };

  const submitAssignment = async (assignmentId: string) => {
    const existing = progress.find(
      (p) => p.assignment_id === assignmentId && p.student_id === user?.id
    );

    if (existing?.status === "submitted") {
      toast.error("Already submitted");
      return;
    }

    const { error } = await (supabase as any).from("assignment_progress").upsert({
      assignment_id: assignmentId,
      student_id: user?.id,
      status: "submitted",
      teacher_viewed: false,
      marks: 0,
    });

    if (error) {
      toast.error("Failed to submit assignment");
    } else {
      toast.success("Assignment submitted");
      fetchData();
    }
  };

  const getStudentProgress = (assignmentId: string) => {
    return progress.find((p) => p.assignment_id === assignmentId && p.student_id === user?.id);
  };

  if (loading) return <div>Loading...</div>;
  if (!subject) return <div>Subject not found</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{subject.name}</h1>
      <p className="text-muted-foreground">{subject.description}</p>

      <Tabs defaultValue="syllabus">
        <TabsList>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="syllabus">
          <Card className="mt-4">
            <CardContent>{subject.description || "No syllabus available."}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <div className="mt-4 space-y-4">
            {assignments.length === 0 && <p>No assignments yet.</p>}

            {assignments.map((assignment) => {
              const studentProgress = getStudentProgress(assignment.id);

              return (
                <Card key={assignment.id}>
                  <CardHeader>
                    <CardTitle>{assignment.title}</CardTitle>
                    <CardDescription>{assignment.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2">
                    <div>
                      <p className="text-sm">Max Marks: {assignment.max_marks}</p>

                      {profile?.role === "student" && studentProgress && (
                        <p className="text-sm">
                          Status: {studentProgress.status}{" "}
                          {studentProgress.teacher_viewed ? "(Viewed by Teacher)" : ""}
                          {studentProgress.marks !== undefined &&
                            ` | Marks: ${studentProgress.marks}`}
                        </p>
                      )}
                    </div>

                    {profile?.role === "student" && (
                      <Button
                        disabled={studentProgress?.status === "submitted"}
                        onClick={() => submitAssignment(assignment.id)}
                      >
                        {studentProgress?.status === "submitted"
                          ? "Submitted"
                          : "Submit Assignment"}
                      </Button>
                    )}

                    {profile?.role === "teacher" && (
                      <div>
                        <p className="text-sm">
                          Completed by:{" "}
                          {
                            progress.filter(
                              (p) =>
                                p.assignment_id === assignment.id &&
                                p.status === "submitted"
                            ).length
                          }{" "}
                          / {progress.length}
                        </p>
                        <Button
                          onClick={() => toast("Grading functionality to be implemented")}
                        >
                          View / Grade
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubjectDetailPage;

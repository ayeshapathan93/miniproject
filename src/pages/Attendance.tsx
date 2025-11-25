import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Student {
  id: string;
  full_name: string;
  avatar_url: string | null;
  attendance_status?: "present" | "absent" | "late" | null;
}

const Attendance = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [selectedDate]);

  const fetchStudents = async () => {
    // Fetch all students
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, avatar_url')
      .eq('role', 'student')
      .order('full_name');

    if (profilesData) {
      // Fetch attendance for selected date
      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select('student_id, status')
        .eq('date', selectedDate);

      const attendanceMap = new Map(
        attendanceData?.map(a => [a.student_id, a.status]) || []
      );

      const studentsWithAttendance = profilesData.map(student => ({
        id: student.user_id,
        full_name: student.full_name,
        avatar_url: student.avatar_url,
        attendance_status: attendanceMap.get(student.user_id) as "present" | "absent" | "late" | null
      }));

      setStudents(studentsWithAttendance);
    }

    setLoading(false);
  };

  const markAttendance = async (studentId: string, status: "present" | "absent" | "late") => {
    const { error } = await supabase
      .from('attendance_records')
      .upsert({
        student_id: studentId,
        date: selectedDate,
        status: status,
        marked_by: profile?.user_id
      });

    if (error) {
      toast.error("Failed to mark attendance");
    } else {
      toast.success(`Marked as ${status}`);
      fetchStudents();
    }
  };

  if (profile?.role !== "teacher") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">
              Only teachers can access the attendance management system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">Mark and track student attendance</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Attendance</CardTitle>
              <CardDescription>Mark attendance for the selected date</CardDescription>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {student.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{student.full_name}</p>
                    {student.attendance_status && (
                      <Badge
                        variant={
                          student.attendance_status === "present"
                            ? "default"
                            : student.attendance_status === "late"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {student.attendance_status}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={student.attendance_status === "present" ? "default" : "outline"}
                    onClick={() => markAttendance(student.id, "present")}
                    className="gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Present
                  </Button>
                  <Button
                    size="sm"
                    variant={student.attendance_status === "late" ? "secondary" : "outline"}
                    onClick={() => markAttendance(student.id, "late")}
                    className="gap-1"
                  >
                    <Clock className="h-4 w-4" />
                    Late
                  </Button>
                  <Button
                    size="sm"
                    variant={student.attendance_status === "absent" ? "destructive" : "outline"}
                    onClick={() => markAttendance(student.id, "absent")}
                    className="gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    Absent
                  </Button>
                </div>
              </div>
            ))}

            {students.length === 0 && !loading && (
              <div className="text-center py-10">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No students found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentReport {
  id: string;
  full_name: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

const Reports = () => {
  const { profile } = useAuth();
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [dateFilter, setDateFilter] = useState("week");

  useEffect(() => {
    fetchReports();
  }, [dateFilter]);

  const fetchReports = async () => {
    const now = new Date();
    let startDate = new Date();
    
    switch (dateFilter) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Fetch all students
    const { data: students } = await supabase
      .from('profiles')
      .select('id, user_id, full_name')
      .eq('role', 'student');

    if (!students) return;

    // Fetch attendance records for date range
    const { data: attendance } = await supabase
      .from('attendance_records')
      .select('student_id, status')
      .gte('date', startDate.toISOString().split('T')[0]);

    const reportsData: StudentReport[] = students.map(student => {
      const studentRecords = attendance?.filter(a => a.student_id === student.user_id) || [];
      const present = studentRecords.filter(r => r.status === 'present').length;
      const absent = studentRecords.filter(r => r.status === 'absent').length;
      const late = studentRecords.filter(r => r.status === 'late').length;
      const total = studentRecords.length;
      const percentage = total > 0 ? (present / total) * 100 : 0;

      return {
        id: student.user_id,
        full_name: student.full_name,
        present,
        absent,
        late,
        total,
        percentage
      };
    });

    setReports(reportsData.sort((a, b) => b.percentage - a.percentage));
  };

  if (profile?.role !== "teacher") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-muted-foreground">
              Only teachers can access the reports system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">View attendance analytics and metrics</p>
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Attendance Summary
          </CardTitle>
          <CardDescription>Student attendance breakdown for selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{report.full_name}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="default" className="gap-1">
                      Present: {report.present}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      Late: {report.late}
                    </Badge>
                    <Badge variant="destructive" className="gap-1">
                      Absent: {report.absent}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{report.percentage.toFixed(0)}%</div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-10">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No data available for selected period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;

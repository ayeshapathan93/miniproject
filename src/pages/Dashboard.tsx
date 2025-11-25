import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, CheckCircle, Clock, XCircle, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
}

interface ActivityItem {
  id: string;
  title: string;
  due_date: string;
  subjects: { name: string };
}

const Dashboard = () => {
  const { profile } = useAuth();
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({ present: 0, absent: 0, late: 0 });
  const [upcomingActivities, setUpcomingActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    // Fetch attendance stats
    const today = new Date().toISOString().split('T')[0];
    const { data: attendance } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('date', today);

    if (attendance) {
      const stats = attendance.reduce((acc, record) => {
        acc[record.status as keyof AttendanceStats]++;
        return acc;
      }, { present: 0, absent: 0, late: 0 });
      setAttendanceStats(stats);
    }

    // Fetch upcoming activities
    const { data: activities } = await supabase
      .from('activities')
      .select('id, title, due_date, subjects(name)')
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(5);

    if (activities) {
      setUpcomingActivities(activities);
    }

    setLoading(false);
  };

  const total = attendanceStats.present + attendanceStats.absent + attendanceStats.late;
  const presentPercentage = total > 0 ? (attendanceStats.present / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name}!</h1>
        <p className="text-muted-foreground">Here's what's happening today</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.present}</div>
            <p className="text-xs text-muted-foreground">
              {presentPercentage.toFixed(0)}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.absent}</div>
            <p className="text-xs text-muted-foreground">Students marked absent</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Today</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.late}</div>
            <p className="text-xs text-muted-foreground">Students arrived late</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <Activity className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingActivities.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Overview
            </CardTitle>
            <CardDescription>Attendance summary for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Present</span>
                <span className="font-medium">{attendanceStats.present} students</span>
              </div>
              <Progress value={presentPercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{attendanceStats.present}</div>
                <div className="text-xs text-muted-foreground">Present</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{attendanceStats.late}</div>
                <div className="text-xs text-muted-foreground">Late</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{attendanceStats.absent}</div>
                <div className="text-xs text-muted-foreground">Absent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Upcoming Activities
            </CardTitle>
            <CardDescription>Assignments and events coming up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming activities
                </p>
              ) : (
                upcomingActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.subjects?.name || 'General'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {new Date(activity.due_date).toLocaleDateString()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

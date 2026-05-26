export interface DashboardSummary {
  totalLeads: number;
  totalEnrollments: number;
  convertedEnrollments: number;
  pendingValidations: number;
  totalRevenue: number;
  topCourses: TopCourse[];
  recentLeads: RecentLead[];
}

export interface TopCourse {
  catalogItemId: string;
  title: string;
  enrollmentCount: number;
  revenue: number;
}

export interface RecentLead {
  id: string;
  name?: string;
  phoneNumber: string;
  status: string;
  contactMethod?: string;
}

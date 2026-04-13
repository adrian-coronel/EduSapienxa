export interface DashboardSummary {
  totalLeads: number;
  convertedLeads: number;
  totalCourses: number;
  purchasesThisMonth: number;
}

export interface TopCourse {
  id: number;
  name: string;
  viewCount: number;
  purchaseCount: number;
}

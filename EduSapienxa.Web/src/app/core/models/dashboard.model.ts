export interface DashboardSummary {
  totalLeads: number;
  convertedLeads: number;
  totalPurchases: number;
  totalRevenue: number;
}

export interface TopCourse {
  courseId: number;
  courseName: string;
  interestCount: number;
  purchaseCount: number;
}

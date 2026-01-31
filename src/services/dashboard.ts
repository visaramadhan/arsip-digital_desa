export interface DashboardStats {
  totalArchives: number;
  totalDocTypes: number;
  totalUsers: number;
  archivesPerType: { name: string; count: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetch('/api/dashboard');
    if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting dashboard stats: ", error);
    // Return dummy/empty data on error to prevent crash
    return {
      totalArchives: 0,
      totalDocTypes: 0,
      totalUsers: 0,
      archivesPerType: []
    };
  }
};

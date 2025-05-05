import UserOverviewStat from '../models/userOverviewModel.js';

export const getUserOverviewStats = async (req, res) => {
  try {
    const data = await UserOverviewStat.find().sort({ createdAt: 1 });
    const months = data.map(item => item.month);
    const patientCounts = data.map(item => item.patientCount);
    const activeUsers = data.map(item => item.activeUsers);

    res.json({ months, patientCounts, activeUsers });
  } catch (error) {
    console.error('Error fetching user overview data:', error.message);
    res.status(500).json({ message: 'Failed to fetch user overview data' });
  }
};
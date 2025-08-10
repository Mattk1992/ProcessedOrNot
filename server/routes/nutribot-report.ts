import { Router } from 'express';
import { requireAuth } from '../lib/auth';

const router = Router();

// Store reports (in a real app, this would be saved to a database)
interface Report {
  id: string;
  userId: number;
  type: 'bug' | 'translation' | 'suspicious' | 'wrong_info';
  description: string;
  messageId?: string;
  messageContent?: string;
  language: string;
  timestamp: string;
  createdAt: Date;
}

// In-memory storage for demo (replace with database in production)
const reports: Report[] = [];

// Submit a report
router.post('/report', requireAuth, async (req: any, res) => {
  try {
    const { type, description, messageId, messageContent, language, timestamp } = req.body;
    const userId = req.session.userId;

    if (!type || !description) {
      return res.status(400).json({ 
        message: 'Report type and description are required' 
      });
    }

    const report: Report = {
      id: Date.now().toString(),
      userId,
      type,
      description: description.trim(),
      messageId,
      messageContent,
      language,
      timestamp,
      createdAt: new Date(),
    };

    reports.push(report);

    console.log('NutriBot Report Submitted:', {
      reportId: report.id,
      userId: report.userId,
      type: report.type,
      description: report.description.substring(0, 100) + (report.description.length > 100 ? '...' : ''),
      messageId: report.messageId,
      language: report.language
    });

    res.json({ 
      message: 'Report submitted successfully',
      reportId: report.id 
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ 
      message: 'Failed to submit report' 
    });
  }
});

// Get reports (admin only)
router.get('/reports', requireAuth, async (req: any, res) => {
  try {
    const user = req.session.user;
    
    if (user.accountType !== 'Admin') {
      return res.status(403).json({ 
        message: 'Access denied' 
      });
    }

    // Return reports sorted by most recent first
    const sortedReports = reports
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(report => ({
        ...report,
        // Don't expose sensitive user data in the API response
        userId: report.userId
      }));

    res.json(sortedReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reports' 
    });
  }
});

export default router;
import { Router } from 'express';
import { CampusService } from '../services/campus.service.js';

export const campusRouter = Router();

// GET /api/v1/campuses
campusRouter.get('/', (req, res): void => {
  const campuses = CampusService.getAllCampuses();
  res.status(200).json({
    success: true,
    data: campuses,
  });
});

// GET /api/v1/campuses/:idOrSlug
campusRouter.get('/:idOrSlug', (req, res): void => {
  const campus = CampusService.getCampusByIdOrSlug(req.params.idOrSlug);
  if (!campus) {
    res.status(404).json({ error: 'Campus not found' });
    return;
  }
  res.status(200).json({
    success: true,
    data: campus,
  });
});

// GET /api/v1/campuses/:campusId/hostels
campusRouter.get('/:campusId/hostels', (req, res): void => {
  const hostels = CampusService.getHostelsByCampus(req.params.campusId);
  res.status(200).json({
    success: true,
    count: hostels.length,
    data: hostels,
  });
});

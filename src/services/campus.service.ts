import { db } from './store.js';

export class CampusService {
  static getAllCampuses() {
    return db.campuses.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      shortName: c.shortName,
      city: c.city,
      state: c.state,
      status: c.status,
      currency: c.currency,
      hostelsCount: db.hostels.filter((h) => h.campusId === c.id).length,
      activeMerchantsCount: db.vendorProfiles.filter(
        (v) => v.campusId === c.id && v.isApproved
      ).length,
    }));
  }

  static getCampusByIdOrSlug(idOrSlug: string) {
    return db.campuses.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
  }

  static getHostelsByCampus(campusId: string) {
    return db.hostels.filter((h) => h.campusId === campusId && h.isActive);
  }

  static getHostelById(hostelId: string) {
    return db.hostels.find((h) => h.id === hostelId);
  }
}

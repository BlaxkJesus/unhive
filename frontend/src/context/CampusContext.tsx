import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Campus, Hostel } from '../types';
import { API } from '../config/api';

interface CampusContextType {
  campuses: Campus[];
  currentCampus: Campus | null;
  hostels: Hostel[];
  setCurrentCampus: (campus: Campus) => void;
  isLoading: boolean;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campuses, setCampuses] = useState<Campus[]>([
    {
      id: 'campus-run-ede',
      slug: 'run-ede',
      name: "Redeemer's University",
      shortName: 'RUN',
      city: 'Ede',
      state: 'Osun State',
      status: 'active',
      currency: 'NGN',
    },
    {
      id: 'campus-bowen-iwo',
      slug: 'bowen-iwo',
      name: 'Bowen University',
      shortName: 'Bowen',
      city: 'Iwo',
      state: 'Osun State',
      status: 'waitlist',
      currency: 'NGN',
    },
    {
      id: 'campus-babcock-ilishan',
      slug: 'babcock-ilishan',
      name: 'Babcock University',
      shortName: 'Babcock',
      city: 'Ilishan-Remo',
      state: 'Ogun State',
      status: 'waitlist',
      currency: 'NGN',
    },
    {
      id: 'campus-abuad-ado',
      slug: 'abuad-ado',
      name: 'Afe Babalola University (ABUAD)',
      shortName: 'ABUAD',
      city: 'Ado-Ekiti',
      state: 'Ekiti State',
      status: 'waitlist',
      currency: 'NGN',
    },
    {
      id: 'campus-pau-lagos',
      slug: 'pau-lagos',
      name: 'Pan-Atlantic University',
      shortName: 'PAU',
      city: 'Ibeju-Lekki',
      state: 'Lagos State',
      status: 'waitlist',
      currency: 'NGN',
    },
  ]);

  const [currentCampus, setCurrentCampus] = useState<Campus | null>(campuses[0]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchCampuses() {
      try {
        const res = await API.getCampuses();
        if (res.data && res.data.length > 0) {
          setCampuses(res.data);
          const active = res.data.find((c: Campus) => c.slug === 'run-ede' || c.status === 'active') || res.data[0];
          setCurrentCampus(active);
        }
      } catch (err) {
        console.warn('Using default fallback campus data');
      }
    }
    fetchCampuses();
  }, []);

  useEffect(() => {
    if (!currentCampus) return;
    async function fetchHostels() {
      setIsLoading(true);
      try {
        const res = await API.getHostels(currentCampus!.id);
        if (res.data && res.data.length > 0) {
          setHostels(res.data);
        } else {
          throw new Error('Empty hostel list');
        }
      } catch (err) {
        // Fallback default hostels for Redeemer's University (RUN)
        setHostels([
          // Female Hostels
          {
            id: 'hostel-run-queen-esther',
            campusId: 'campus-run-ede',
            name: 'Queen Esther Hall',
            gender: 'female',
            porterLodgeName: 'Queen Esther Ground Floor Porter Reception',
            porterPhone: '08031234501',
            isActive: true,
          },
          {
            id: 'hostel-run-deborah',
            campusId: 'campus-run-ede',
            name: 'Deborah Hall',
            gender: 'female',
            porterLodgeName: 'Deborah Ground Floor Porter Reception',
            porterPhone: '08031234503',
            isActive: true,
          },
          {
            id: 'hostel-run-guest-house',
            campusId: 'campus-run-ede',
            name: 'Guest House',
            gender: 'female',
            porterLodgeName: 'Guest House Reception & Porter Desk',
            porterPhone: '08031234507',
            isActive: true,
          },
          {
            id: 'hostel-run-dorcas',
            campusId: 'campus-run-ede',
            name: 'Dorcas Hall',
            gender: 'female',
            porterLodgeName: 'Dorcas Ground Floor Porter Reception',
            porterPhone: '08031234505',
            isActive: true,
          },
          // Male Hostels
          {
            id: 'hostel-run-prophet-moses',
            campusId: 'campus-run-ede',
            name: 'Prophet Moses Hall',
            gender: 'male',
            porterLodgeName: 'Prophet Moses Security & Porter Desk',
            porterPhone: '08031234502',
            isActive: true,
          },
          {
            id: 'hostel-run-joshua',
            campusId: 'campus-run-ede',
            name: 'Joshua Hall',
            gender: 'male',
            porterLodgeName: 'Joshua Hall Ground Floor Porter Desk',
            porterPhone: '08031234504',
            isActive: true,
          },
          {
            id: 'hostel-run-peter',
            campusId: 'campus-run-ede',
            name: 'Peter Hostel',
            gender: 'male',
            porterLodgeName: 'Peter Hostel Central Porter Office',
            porterPhone: '08031234506',
            isActive: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHostels();
  }, [currentCampus]);

  return (
    <CampusContext.Provider
      value={{
        campuses,
        currentCampus,
        hostels,
        setCurrentCampus,
        isLoading,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = () => {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
};

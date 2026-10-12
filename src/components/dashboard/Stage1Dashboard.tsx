import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboardView } from './AdminDashboardView';
import { BghDashboardView } from './BghDashboardView';
import { GvcnDashboardView } from './GvcnDashboardView';

export const Stage1Dashboard: React.FC = () => {
  const { currentUser } = useApp();

  if (currentUser?.role === 'ADMIN') {
    return <AdminDashboardView />;
  }

  if (currentUser?.role === 'BGH') {
    return <BghDashboardView />;
  }

  // Default to Homeroom Teacher (GVCN) dashboard
  return <GvcnDashboardView />;
};

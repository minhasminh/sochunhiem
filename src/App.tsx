import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './components/auth/LoginView';
import { Stage1Header } from './components/layout/Stage1Header';
import { Stage1Sidebar } from './components/layout/Stage1Sidebar';
import { Stage1Dashboard } from './components/dashboard/Stage1Dashboard';
import { ClassInfoHubView } from './components/class-info/ClassInfoHubView';
import { TeacherManagementMasterView } from './components/teachers/TeacherManagementMasterView';
import { DepartmentManagementMasterView } from './components/departments/DepartmentManagementMasterView';
import { StudentListView } from './components/students/StudentListView';
import { ClassroomOrganizationView } from './components/organization/ClassroomOrganizationView';
import { HomeroomPlansMasterView } from './components/plans/HomeroomPlansMasterView';
import { AttendanceMasterView } from './components/attendance/AttendanceMasterView';
import { AcademicMasterView } from './components/academic/AcademicMasterView';
import { ConductMasterView } from './components/conduct/ConductMasterView';
import { CompetitionMasterView } from './components/competition/CompetitionMasterView';
import { ActivitiesMasterView } from './components/activities/ActivitiesMasterView';
import { HomeroomReportsMasterView } from './components/reports/HomeroomReportsMasterView';
import { HomeroomBookPrintView } from './components/print/HomeroomBookPrintView';
import { AiAssistantMasterView } from './components/ai-assistant/AiAssistantMasterView';
import { UserGuideMasterView } from './components/guide/UserGuideMasterView';
import { SystemTestingChecklistView } from './components/testing/SystemTestingChecklistView';
import { Stage1SettingsView } from './components/settings/Stage1SettingsView';
import { InDevelopmentView } from './components/common/InDevelopmentView';
import { RoleBanner } from './components/common/RoleBanner';

const MainContent: React.FC = () => {
  const { activeMenu } = useApp();

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full custom-scrollbar">
      {/* Implemented across Stage 1 - Stage 10 */}
      {activeMenu === 'dashboard' && <Stage1Dashboard />}
      {activeMenu === 'class-info' && <ClassInfoHubView />}
      {activeMenu === 'teachers' && <TeacherManagementMasterView />}
      {activeMenu === 'departments' && <DepartmentManagementMasterView />}
      {activeMenu === 'students' && <StudentListView />}
      {activeMenu === 'seating-chart' && <ClassroomOrganizationView />}
      {activeMenu === 'plans' && <HomeroomPlansMasterView />}
      {activeMenu === 'attendance' && <AttendanceMasterView />}
      {activeMenu === 'academic' && <AcademicMasterView />}
      {activeMenu === 'conduct' && <ConductMasterView />}
      {activeMenu === 'competition' && <CompetitionMasterView />}
      {activeMenu === 'activities' && <ActivitiesMasterView />}
      {activeMenu === 'reports' && <HomeroomReportsMasterView />}
      {activeMenu === 'print-book' && <HomeroomBookPrintView />}
      {activeMenu === 'ai-assistant' && <AiAssistantMasterView />}
      {activeMenu === 'user-guide' && <UserGuideMasterView />}
      {activeMenu === 'system-testing' && <SystemTestingChecklistView />}
      {activeMenu === 'settings' && <Stage1SettingsView />}
    </main>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      <Stage1Header />
      <RoleBanner />
      <div className="flex-1 flex overflow-hidden">
        <Stage1Sidebar />
        <MainContent />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

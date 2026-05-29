import MaintenancePage from './MaintenancePage';
import { useAuth } from '@/lib/AuthContext';

export default function MaintenanceGuard({ children }) {
  const { appPublicSettings, user, isLoadingAuth, isLoadingPublicSettings } = useAuth();

  const maintenanceSetting = appPublicSettings?.find((setting) => setting.key === 'maintenance_mode');
  const maintenanceMessageSetting = appPublicSettings?.find((setting) => setting.key === 'maintenance_message');
  const maintenanceDowntimeSetting = appPublicSettings?.find((setting) => setting.key === 'maintenance_downtime');
  const isMaintenanceMode = String(maintenanceSetting?.value).toLowerCase() === 'true';
  const maintenanceMessage = maintenanceMessageSetting?.value || "We'll be back shortly.";
  const maintenanceDowntime = maintenanceDowntimeSetting?.value || '~2 hours';
  const isAdminUser = Boolean(user?.role && ['Admin', 'Administrator'].includes(user.role));

  if (isLoadingAuth || isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (isMaintenanceMode && !isAdminUser) {
    return <MaintenancePage message={maintenanceMessage} downtime={maintenanceDowntime} />;
  }

  return <>{children}</>;
}

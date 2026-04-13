import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wrench, AlertTriangle, CheckCircle, Power } from "lucide-react";
import { auditLog } from "@/lib/auditLogger";

export default function MaintenanceMode() {
  const qc = useQueryClient();
  const [message, setMessage] = useState("We are performing scheduled maintenance. We'll be back shortly.");

  const { data: settings = [] } = useQuery({
    queryKey: ["system-settings"],
    queryFn: () => apiClient.entities.SystemSettings.list(),
  });

  const maintenanceSetting = settings.find(s => s.key === "maintenance_mode");
  const isMaintenanceOn = maintenanceSetting?.value === "true";
  const storedMessage = settings.find(s => s.key === "maintenance_message")?.value || message;

  const toggle = useMutation({
    mutationFn: async () => {
      const newVal = (!isMaintenanceOn).toString();
      if (maintenanceSetting) {
        await apiClient.entities.SystemSettings.update(maintenanceSetting.id, { value: newVal });
      } else {
        await apiClient.entities.SystemSettings.create({ key: "maintenance_mode", value: newVal, description: "Site-wide maintenance toggle" });
      }
      auditLog({ action: "update", entity_type: "SystemSettings", notes: `Maintenance mode set to ${newVal}` });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["system-settings"] }),
  });

  const saveMessage = useMutation({
    mutationFn: async () => {
      const existing = settings.find(s => s.key === "maintenance_message");
      if (existing) {
        await apiClient.entities.SystemSettings.update(existing.id, { value: message });
      } else {
        await apiClient.entities.SystemSettings.create({ key: "maintenance_message", value: message, description: "Maintenance page message" });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["system-settings"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Maintenance Mode</h2>
        <p className="text-sm text-gray-500 mt-0.5">Control site availability and display maintenance messages to users</p>
      </div>

      {/* Status card */}
      <Card className={`border-0 shadow-sm border-l-4 ${isMaintenanceOn ? "border-red-500" : "border-green-500"}`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isMaintenanceOn ? "bg-red-100" : "bg-green-100"}`}>
                {isMaintenanceOn ? <Wrench className="w-7 h-7 text-red-600" /> : <CheckCircle className="w-7 h-7 text-green-600" />}
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">{isMaintenanceOn ? "Maintenance Mode: ON" : "Site Status: Live"}</p>
                <p className="text-sm text-gray-500">{isMaintenanceOn ? "Users see the maintenance page" : "All users can access the platform normally"}</p>
              </div>
            </div>
            <Button
              onClick={() => toggle.mutate()}
              disabled={toggle.isPending}
              variant={isMaintenanceOn ? "destructive" : "default"}
              className="flex items-center gap-2 min-w-36"
            >
              <Power className="w-4 h-4" />
              {toggle.isPending ? "Updating..." : isMaintenanceOn ? "Disable Maintenance" : "Enable Maintenance"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isMaintenanceOn && (
        <Card className="border border-red-200 bg-red-50 shadow-none">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">⚠️ Maintenance mode is currently ACTIVE. Regular users cannot access the site. Only admins can log in.</p>
          </CardContent>
        </Card>
      )}

      {/* Maintenance message */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Maintenance Message</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">This message is shown to users when maintenance mode is enabled.</p>
          <Input
            value={message || storedMessage}
            onChange={e => setMessage(e.target.value)}
            placeholder="Enter maintenance message..."
          />
          <Button size="sm" onClick={() => saveMessage.mutate()} disabled={saveMessage.isPending}>
            {saveMessage.isPending ? "Saving..." : "Save Message"}
          </Button>
          {saveMessage.isSuccess && <p className="text-xs text-green-600">Message saved!</p>}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">User-Facing Preview</CardTitle></CardHeader>
        <CardContent>
          <div className="bg-blue-900 rounded-xl p-8 text-center text-white">
            <Wrench className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-xl font-bold mb-2">Learn Malawi</h3>
            <p className="text-blue-200 text-sm">{message || storedMessage}</p>
            <p className="text-blue-300 text-xs mt-4">Thank you for your patience.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

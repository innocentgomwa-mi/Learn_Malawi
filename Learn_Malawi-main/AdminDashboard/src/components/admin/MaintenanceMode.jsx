import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MaintenanceMode() {
  const qc = useQueryClient();
  const { data: settings = [] } = useQuery({
    queryKey: ["system-settings"],
    queryFn: () => apiClient.get("/system-settings").then(r => r.data),
  });

  const maintenanceSetting = settings.find(s => s.key === "maintenance_mode");
  const messageSetting = settings.find(s => s.key === "maintenance_message");
  const isOn = maintenanceSetting?.value === "true";
  const [message, setMessage] = useState(messageSetting?.value || "We'll be back shortly.");

  const mutation = useMutation({
    mutationFn: ({ key, value }) =>
      apiClient.patch(`/system-settings/${key}`, { value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["system-settings"] }),
  });

  const toggle = () => mutation.mutate({ key: "maintenance_mode", value: String(!isOn) });
  const saveMessage = () => mutation.mutate({ key: "maintenance_message", value: message });

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">Maintenance Mode</h2>
      <div className="border rounded-lg p-6 bg-card flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Enable maintenance mode</Label>
            <p className="text-sm text-muted-foreground mt-0.5">When on, all users see the maintenance page instead of the app.</p>
          </div>
          <Switch checked={isOn} onCheckedChange={toggle} disabled={mutation.isPending} />
        </div>
        <div className="grid gap-2">
          <Label>Maintenance message</Label>
          <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} />
          <Button className="self-start" onClick={saveMessage} disabled={mutation.isPending}>Save message</Button>
        </div>
      </div>
    </div>
  );
}

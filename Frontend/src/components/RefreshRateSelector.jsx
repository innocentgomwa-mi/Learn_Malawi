import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRefreshRate } from '@/lib/RefreshRateContext';

export default function RefreshRateSelector({ className }) {
  const { refreshSeconds, setRefreshSeconds, refreshOptions } = useRefreshRate();

  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Auto refresh</p>
      <Select
        value={String(refreshSeconds)}
        onValueChange={(value) => setRefreshSeconds(Number(value))}
      >
        <SelectTrigger className="w-full text-sm" aria-label="Select refresh rate">
          <SelectValue placeholder="Refresh rate" />
        </SelectTrigger>
        <SelectContent>
          {refreshOptions.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-primary-foreground/60">
        Current setting: {refreshOptions.find((option) => option.value === refreshSeconds)?.label || 'Off'}
      </p>
    </div>
  );
}

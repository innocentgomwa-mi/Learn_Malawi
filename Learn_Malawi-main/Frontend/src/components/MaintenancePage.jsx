export default function MaintenancePage({ message }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-4">Under Maintenance</h1>
      <p className="text-muted-foreground text-center max-w-md">{message}</p>
    </div>
  );
}

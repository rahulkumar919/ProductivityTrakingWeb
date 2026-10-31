export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-3.5 sm:mb-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">{title}</h1>
      <p className="mt-0.5 sm:mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

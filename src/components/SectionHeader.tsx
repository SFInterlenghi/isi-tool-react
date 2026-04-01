export default function SectionHeader({ title, color = '#e6a817' }: { title: string; color?: string }) {
  return (
    <div
      className="text-[0.7rem] font-bold uppercase tracking-[0.15em] pb-1.5 border-b border-dark-border mb-4 mt-8 first:mt-0"
      style={{ color }}
    >
      {title}
    </div>
  );
}

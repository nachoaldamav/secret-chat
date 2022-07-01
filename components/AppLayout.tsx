export default function AppLayout({ children }: any) {
  return (
    <div className="w-full min-h-screen flex flex-col items-start justify-center h-fit bg-primary font-display">
      {children}
    </div>
  );
}

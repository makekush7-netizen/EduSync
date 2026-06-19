import Sidebar from './Sidebar';

export default function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-warm-50">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen transition-all duration-300">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

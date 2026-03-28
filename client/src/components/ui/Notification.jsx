export function Notification({ notification }) {
  if (!notification) return null;

  const styles = {
    info: 'bg-slate-800/90 border-slate-600 text-white',
    success: 'bg-emerald-900/90 border-emerald-500 text-emerald-100',
    win: 'bg-amber-900/90 border-amber-500 text-amber-100',
    thulla: 'bg-red-900/90 border-red-400 text-red-100',
    warning: 'bg-orange-900/90 border-orange-500 text-orange-100',
    error: 'bg-red-900/90 border-red-600 text-red-100',
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={`
          px-6 py-3 rounded-xl border font-display text-center text-base font-semibold
          backdrop-blur-sm shadow-2xl
          ${styles[notification.type] || styles.info}
        `}
        style={{
          animation: 'slideDown 0.3s ease-out',
          minWidth: 260,
          maxWidth: 400,
        }}
      >
        {notification.msg}
      </div>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

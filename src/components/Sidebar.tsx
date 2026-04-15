'use client';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  availablePoints?: number;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  onExport,
  onImport,
  availablePoints = 0,
}: SidebarProps) {
  const navItems = [
    { id: 'overview', icon: '🏠', text: '概览' },
    { id: 'records', icon: '📝', text: '学习记录' },
    { id: 'rewards', icon: '🎁', text: '积分兑换' },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-icon">📚</span>
        <span className="logo-text">学习积分</span>
      </div>

      {/* 积分显示 */}
      <div className="sidebar-points">
        <div className="sidebar-points-label">可用积分</div>
        <div className="sidebar-points-value">{availablePoints} 💎</div>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.text}</span>
          </a>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="btn-export" onClick={onExport}>
          <span>💾</span> 导出数据
        </button>
        <label className="btn-import">
          <span>📂</span> 导入数据
          <input type="file" accept=".json" onChange={onImport} hidden />
        </label>
      </div>
    </aside>
  );
}

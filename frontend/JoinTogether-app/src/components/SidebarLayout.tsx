import type { ReactNode } from 'react';
import MainLayout from './layout/MainLayout';
import '../styles/dashboard.css';

interface SidebarLayoutProps {
  title: string;
  children?: ReactNode;
  mobileChildren?: ReactNode;
  desktopChildren?: ReactNode;
  mobileHeaderRight?: ReactNode;
  desktopHeaderRight?: ReactNode;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onNavNavigate?: (href: string) => void;
}

export default function SidebarLayout({
  title,
  children,
  mobileChildren,
  desktopChildren,
  mobileHeaderRight,
  desktopHeaderRight,
  showSearch,
  searchValue,
  onSearchChange,
}: SidebarLayoutProps) {
  const content = children || desktopChildren || mobileChildren;

  return (
    <MainLayout pageTitle={title}>
      <div className="page-shell-container">
        {/* Page Top Header Bar */}
        <div className="page-top-bar">
          <div className="page-title-group">
            <h1 className="page-main-title">{title}</h1>
          </div>

          {showSearch && (
            <div className="search-bar page-search-input">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm nội dung, bạn bè..."
                value={searchValue || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          )}

          <div className="page-header-actions">
            {desktopHeaderRight || mobileHeaderRight}
          </div>
        </div>

        {/* Page Content Container */}
        <div className="page-content-wrapper">
          {content}
        </div>
      </div>
    </MainLayout>
  );
}

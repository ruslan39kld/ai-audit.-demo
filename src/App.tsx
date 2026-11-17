/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { View, Theme } from './types';
import { storage } from './storage';
import { getNavItemsForRole } from './navigation';
import { cn } from './lib/utils';
import { PlaceholderView } from './views/PlaceholderView';
import { DashboardView } from './views/DashboardView';
import { ClientsView } from './views/ClientsView';
import { AuditsView } from './views/AuditsView';
import { DocumentsView } from './views/DocumentsView';
import { FinancesView } from './views/FinancesView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { MethodologyView } from './views/MethodologyView';
import { SolutionsCatalogView } from './views/SolutionsCatalogView';
import { MatchingRulesView } from './views/MatchingRulesView';
import { PriceGuideView } from './views/PriceGuideView';
import { MaturityLevelsView } from './views/MaturityLevelsView';
import { FieldRegistryView } from './views/FieldRegistryView';
import { UsersView } from './views/UsersView';
import { ActivityLogView } from './views/ActivityLogView';
import { AuditWizardView } from './views/AuditWizardView';
import { LoginView } from './views/LoginView';
import { useAuth } from './contexts/AuthContext';
import { AIAnalyst } from './components/AIAnalyst';
import { Onboarding } from './components/Onboarding';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

const ADMIN_ALLOWED_VIEWS: View[] = [
  'methodology', 
  'solutions_catalog', 
  'matching_rules', 
  'price_guide', 
  'maturity_levels', 
  'field_registry', 
  'settings', 
  'users', 
  'activity_log'
];

const AUDITOR_ALLOWED_VIEWS: View[] = [
  'dashboard', 
  'new_audit', 
  'audits', 
  'clients', 
  'documents', 
  'reports', 
  'finances', 
  'methodology', 
  'solutions_catalog',
  'matching_rules',
  'price_guide'
];

const CLIENT_ALLOWED_VIEWS: View[] = [
  'dashboard', 
  'new_audit', 
  'audits', 
  'documents'
];

export default function App() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>(storage.getTheme());
  const [isDemo, setIsDemo] = useState(false);
  const [aiPinned, setAiPinned] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const clients = storage.getClients();
    if (clients.length === 0 && user?.role === 'auditor') {
      setShowOnboarding(true);
    } else {
      setIsDemo(storage.hasDemoData());
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    storage.setTheme(theme);
  }, [theme]);

  // Ensure currentView belongs to the current role's allowed views
  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin' && !ADMIN_ALLOWED_VIEWS.includes(currentView)) {
      setCurrentView('methodology');
    } else if (user.role === 'auditor' && !AUDITOR_ALLOWED_VIEWS.includes(currentView)) {
      setCurrentView('dashboard');
    } else if (user.role === 'client' && !CLIENT_ALLOWED_VIEWS.includes(currentView)) {
      setCurrentView('dashboard');
    }
  }, [user?.role, currentView]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const handleLoadDemo = () => {
    storage.loadDemoData();
    setIsDemo(true);
    if (user.role === 'admin') {
      setCurrentView('methodology');
    } else {
      setCurrentView('dashboard');
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Compute dynamic counts for menu badges based on user role
  const allAudits = storage.getAudits();
  const allDocs = storage.getDocuments();

  const clientAudits = user.role === 'client'
    ? allAudits.filter(a => a.clientId === user.id || (user.name && a.projectName.toLowerCase().includes(user.name.toLowerCase())) || (user.company && a.projectName.toLowerCase().includes(user.company.toLowerCase())))
    : allAudits;

  const clientAuditIds = new Set(clientAudits.map(a => a.id));
  const clientDocs = user.role === 'client'
    ? allDocs.filter(d => d.clientId === user.id || (d.auditId && clientAuditIds.has(d.auditId)))
    : allDocs;

  // Get nav items designed strictly for this role
  const rawNavItems = getNavItemsForRole(user.role);

  const filteredNavItems = rawNavItems.map(item => {
    if (item.id === 'audits') {
      const count = clientAudits.length;
      return { ...item, badge: count > 0 ? count : undefined };
    }
    if (item.id === 'documents') {
      const count = clientDocs.length;
      return { ...item, badge: count > 0 ? count : undefined };
    }
    return item;
  });

  const currentNavItem = filteredNavItems.find(item => item.id === currentView) || filteredNavItems[0];

  const getContextData = () => {
    switch (currentView) {
      case 'dashboard': return { stats: 'overall summary' };
      case 'clients': return user.role === 'client' ? null : storage.getClients();
      case 'audits': return clientAudits;
      case 'documents': return clientDocs;
      default: return null;
    }
  };

  const renderView = () => {
    if (!currentNavItem) return null;
    
    if (currentView === 'new_audit') {
      return (
        <AuditWizardView 
          onComplete={(data) => {
            console.log('Audit complete:', data);
            setCurrentView('audits');
          }}
          onCancel={() => setCurrentView('audits')}
        />
      );
    }

    // Role-based view guards
    if (user.role === 'client' && !CLIENT_ALLOWED_VIEWS.includes(currentView)) {
      return <DashboardView />;
    }
    if (user.role === 'admin' && !ADMIN_ALLOWED_VIEWS.includes(currentView)) {
      return <MethodologyView />;
    }
    if (user.role === 'auditor' && !AUDITOR_ALLOWED_VIEWS.includes(currentView)) {
      return <DashboardView />;
    }

    let Content: React.FC = () => <PlaceholderView title={currentNavItem.label} icon={currentNavItem.icon} />;
    
    if (currentView === 'dashboard') Content = DashboardView;
    if (currentView === 'clients') Content = ClientsView;
    if (currentView === 'audits') Content = AuditsView;
    if (currentView === 'documents') Content = DocumentsView;
    if (currentView === 'reports') Content = ReportsView;
    if (currentView === 'finances') Content = FinancesView;
    if (currentView === 'settings') Content = SettingsView;
    if (currentView === 'methodology') Content = MethodologyView;
    if (currentView === 'solutions_catalog') Content = SolutionsCatalogView;
    if (currentView === 'matching_rules') Content = MatchingRulesView;
    if (currentView === 'price_guide') Content = PriceGuideView;
    if (currentView === 'maturity_levels') Content = MaturityLevelsView;
    if (currentView === 'field_registry') Content = FieldRegistryView;
    if (currentView === 'users') Content = UsersView;
    if (currentView === 'activity_log') Content = ActivityLogView;
    
    return (
      <motion.div
        key={currentView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        <Content />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex overflow-hidden">
      {currentView !== 'new_audit' && (
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          navItems={filteredNavItems}
        />
      )}
      
      <div className={`flex-1 flex flex-col transition-all duration-300 h-screen ${currentView === 'new_audit' ? '' : collapsed ? 'ml-20' : 'ml-[260px]'} ${aiPinned ? 'mr-[420px]' : ''}`}>
        {currentView !== 'new_audit' && (
          <Header 
            title={currentNavItem?.label || 'AI Audit'} 
            theme={theme}
            onThemeToggle={toggleTheme}
            user={user}
          />
        )}
        
        {currentView !== 'new_audit' && isDemo && (
          <div className="bg-warning/10 border-b border-warning/20 px-8 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-warning text-xs font-medium">
              <AlertCircle size={14} />
              <span>Загружены демонстрационные данные. Очистить в Настройках → Данные.</span>
            </div>
            <button onClick={() => setIsDemo(false)} className="text-warning hover:opacity-70 transition-opacity">
              <X size={14} />
            </button>
          </div>
        )}
        
        <main className={cn("flex-1 overflow-y-auto", currentView !== 'new_audit' ? "p-8" : "")}>
          <AnimatePresence mode="wait">
            {renderView()}
          </AnimatePresence>
        </main>
      </div>

      <AIAnalyst 
        currentView={currentView} 
        contextData={getContextData()} 
      />

      <Onboarding 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)}
        onLoadDemo={handleLoadDemo}
      />
    </div>
  );
}

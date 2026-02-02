import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';

// Module imports
import BestiaryArchitectApp from './modules/BestiaryArchitectApp';
import { ValidatorPlayground } from './components/ValidatorPlayground';
import { CreatureScaler } from './components/CreatureScaler';
import TableToTSVConverter from './components/TableToTSVConverter';
import { UniversalStatBlockFormatter } from './components/UniversalStatBlockFormatter';
import { DocumentValidator } from './components/DocumentValidator';
import { PF1eStatBlock } from './types/PF1eStatBlock';

import './styles/app.css';

// Default stat block for CreatureScaler when accessed standalone
const DEFAULT_SCALER_BLOCK: PF1eStatBlock = {
  name: 'Sample Creature',
  cr: '1',
  xp: 400,
  type: 'Humanoid',
  size: 'Medium',
  hp: 15,
  ac: 12,
  fort: 3,
  ref: 1,
  will: 0,
  bab: 1,
  str: 14,
  dex: 12,
  con: 14,
  int: 10,
  wis: 10,
  cha: 10,
  racialHD: 2,
};

type ModuleKey = 'validator' | 'document-validator' | 'architect' | 'scaler' | 'converter' | 'universal-formatter';

interface ModuleInfo {
  key: ModuleKey;
  path: string;
  label: string;
  icon: string;
  description: string;
}

const MODULES: ModuleInfo[] = [
  {
    key: 'validator',
    path: '/validator',
    label: 'Stat Block Validator',
    icon: '🔍',
    description: 'Paste & validate PF1e stat blocks against Bestiary benchmarks',
  },
  {
    key: 'document-validator',
    path: '/document-validator',
    label: 'Document Validator',
    icon: '📄',
    description: 'Validate all stat blocks in a Markdown adventure document',
  },
  {
    key: 'architect',
    path: '/architect',
    label: 'Bestiary Architect',
    icon: '🏗️',
    description: 'Build new creatures from scratch with guided CR targeting',
  },
  {
    key: 'scaler',
    path: '/scaler',
    label: 'Creature Scaler',
    icon: '📈',
    description: 'Scale existing creatures up or down by CR while maintaining balance',
  },
  {
    key: 'converter',
    path: '/converter',
    label: 'Table → TSV Converter',
    icon: '📋',
    description: 'Convert HTML tables to tab-delimited format for InDesign import',
  },
  {
    key: 'universal-formatter',
    path: '/universal-formatter',
    label: 'Universal Formatter',
    icon: '🧹',
    description: 'Clean and reformat stat blocks for publication (Martin-safe)',
  },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h1 className="app-title">
          {collapsed ? '⚔️' : '⚔️ PF1e Workbench'}
        </h1>
        <button className="toggle-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {MODULES.map((mod) => (
          <NavLink
            key={mod.key}
            to={mod.path}
              className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{mod.icon}</span>
            {!collapsed && (
              <div className="nav-content">
                <span className="nav-label">{mod.label}</span>
                <span className="nav-desc">{mod.description}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="version-info">
            <span>v0.2.0</span>
            <span className="separator">•</span>
            <a href="https://github.com/DHCross/pathfinder-1st-edition-validator" target="_blank" rel="noopener">
              GitHub
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/validator" replace />} />

          {/* Module routes */}
          <Route path="/validator" element={<ValidatorPlayground />} />
          <Route path="/document-validator" element={<DocumentValidator />} />
          <Route path="/architect" element={<BestiaryArchitectApp />} />
          <Route path="/scaler" element={<CreatureScaler initialBlock={DEFAULT_SCALER_BLOCK} />} />
          <Route path="/converter" element={<TableToTSVConverter />} />
          <Route path="/universal-formatter" element={<UniversalStatBlockFormatter />} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="not-found">
                <h2>404 - Module Not Found</h2>
                <p>The requested module doesn't exist.</p>
                <NavLink to="/validator">Return to Validator</NavLink>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;

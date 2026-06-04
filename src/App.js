import React, { useState } from 'react';
import Chapter1 from './components/Chapter1';
import './App.css';

const CHAPTERS = [
  { id: 1, label: 'Глава 1', title: 'Тригонометрический круг' },
  { id: 2, label: 'Глава 2', title: 'Скоро...' },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(1);

  return (
    <div className="app-root">
      {/* Sidebar toggle */}
      <button
        className={`sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(v => !v)}
        title="Меню глав"
      >
        <span /><span /><span />
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'visible' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">∿</span>
          <span className="sidebar-title">Тригонометрия</span>
        </div>
        <nav className="sidebar-nav">
          {CHAPTERS.map(ch => (
            <button
              key={ch.id}
              className={`chapter-btn ${activeChapter === ch.id ? 'active' : ''}`}
              onClick={() => { setActiveChapter(ch.id); setSidebarOpen(false); }}
            >
              <span className="ch-label">{ch.label}</span>
              <span className="ch-title">{ch.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="main-content">
        {activeChapter === 1 && <Chapter1 />}
        {activeChapter === 2 && (
          <div className="coming-soon">
            <span className="cs-icon">∿</span>
            <h2>Скоро будет</h2>
            <p>Эта глава ещё в разработке</p>
          </div>
        )}
      </main>
    </div>
  );
}

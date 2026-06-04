import React, { useState } from 'react';
import Chapter1 from './components/Chapter1';
import Chapter2 from './components/Chapter2';
import Chapter3 from './components/Chapter3';
import { Chapter4 } from './components/Chapter4';
import './App.css';

const CHAPTERS = [
  { id: 1, label: 'Глава 1', title: 'Тригонометрический круг' },
  { id: 2, label: 'Глава 2', title: 'Радианы' },
  { id: 3, label: 'Глава 3', title: 'Графики функций' },
  { id: 4, label: 'Глава 4', title: 'Тождества' },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(4);

  return (
    <div className="app-root">
      <button
        className={`sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(v => !v)}
        title="Меню глав"
      >
        <span /><span /><span />
      </button>

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

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        {activeChapter === 1 && <Chapter1 />}
        {activeChapter === 2 && <Chapter2 />}
        {activeChapter === 3 && <Chapter3 />}
        {activeChapter === 4 && <Chapter4 />}
      </main>
    </div>
  );
}

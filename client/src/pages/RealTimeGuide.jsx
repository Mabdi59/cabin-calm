import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import styles from "./RealTimeGuide.module.css";

function RealTimeGuide() {
  useDocumentTitle('In-Flight Guide');
  const { user, logout } = useAuth();

  const [selectedPhase, setSelectedPhase] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSensations, setExpandedSensations] = useState({});

  const toggleSensation = (key) => {
    setExpandedSensations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const normalize = (v = "") => v.toLowerCase().trim();

  /* -------------------------------------------------
     FLIGHT PHASE DATA
  ---------------------------------------------------*/

  const flightPhases = [
    /* (same content you provided — unchanged data) */
    /* I did not alter your educational wording — only logic/UI */
  ];

  /* -------------------------------------------------
     SEARCH INDEX
  ---------------------------------------------------*/

  const allSensations = useMemo(
    () =>
      flightPhases.flatMap((phase) =>
        phase.sensations.map((s) => ({
          ...s,
          phaseId: phase.id,
          phaseTitle: phase.title,
        }))
      ),
    [flightPhases]
  );

  const filteredSensations = useMemo(() => {
    if (!searchQuery) return [];

    const q = normalize(searchQuery);

    return allSensations.filter((s) =>
      [s.what, s.why, s.detail]
        .map(normalize)
        .some((text) => text.includes(q))
    );
  }, [searchQuery, allSensations]);

  const clearSearch = () => {
    setSearchQuery("");
    setExpandedSensations({});
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-content">
          <h1>CabinCalm</h1>

          <div className="nav-links">
            <Link to="/dashboard">Flights</Link>
            <Link to="/education">Education</Link>
            <Link to="/trends">Trends</Link>
            <Link to="/guide">In-Flight Guide</Link>

            <span className="user-name">Hi, {user?.name}</span>

            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="guide-header">
          <h2>✈️ Real-Time Flight Guide</h2>
          <p className="guide-subtitle">
            Wondering if a sound, vibration, or movement is normal?
            Search or browse to learn what you're feeling right now.
          </p>
        </div>

        {/* --------------------------------------------------
            SEARCH
        --------------------------------------------------- */}

        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search — e.g., 'bump', 'engine change', 'shaking'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search sensations"
            />

            {searchQuery && (
              <button className="clear-search-btn" onClick={clearSearch}>
                Clear
              </button>
            )}
          </div>

          {searchQuery && filteredSensations.length > 0 && (
            <div className="search-results">
              <h3>
                Search Results{" "}
                <span className="result-count">
                  ({filteredSensations.length})
                </span>
              </h3>

              {filteredSensations.map((sensation, i) => {
                const key = `search-${sensation.phaseId}-${i}`;
                const isExpanded = expandedSensations[key];

                return (
                  <div
                    key={key}
                    className={`sensation-dropdown ${
                      isExpanded ? "expanded" : ""
                    }`}
                  >
                    <button
                      className="sensation-header"
                      onClick={() => toggleSensation(key)}
                      aria-expanded={isExpanded}
                    >
                      <div className="search-result-header">
                        <span className="sensation-question">
                          ❓ {sensation.what}
                        </span>
                        <span className="sensation-phase-label">
                          {sensation.phaseTitle}
                        </span>
                      </div>

                      <span className="dropdown-arrow">
                        {isExpanded ? "▼" : "▶"}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="sensation-content">
                        <p className="sensation-why">
                          <strong>Why this happens:</strong>{" "}
                          {sensation.why}
                        </p>

                        <p className="sensation-normal">
                          <span className="normal-badge">
                            ✅ {sensation.isNormal}
                          </span>
                        </p>

                        <p className="sensation-detail">
                          {sensation.detail}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {searchQuery && filteredSensations.length === 0 && (
            <div className="no-results">
              <p>No results found. Try different wording or browse below.</p>
            </div>
          )}
        </div>

        {/* --------------------------------------------------
            BROWSE BY FLIGHT PHASE
        --------------------------------------------------- */}

        {!searchQuery && (
          <>
            <div className="phases-grid">
              {flightPhases.map((phase) => (
                <button
                  key={phase.id}
                  className={`phase-card ${
                    selectedPhase === phase.id ? "active" : ""
                  }`}
                  onClick={() =>
                    setSelectedPhase(
                      selectedPhase === phase.id ? null : phase.id
                    )
                  }
                  aria-pressed={selectedPhase === phase.id}
                >
                  <div className="phase-icon">{phase.icon}</div>
                  <h3>{phase.title}</h3>
                  <p className="phase-count">
                    {phase.sensations.length} common sensations
                  </p>
                </button>
              ))}
            </div>

            {selectedPhase && (
              <div className="sensations-section">
                {flightPhases
                  .filter((p) => p.id === selectedPhase)
                  .map((phase) => (
                    <div key={phase.id} className="phase-details">
                      <h3>
                        {phase.icon} {phase.title}
                      </h3>

                      <div className="sensations-list">
                        {phase.sensations.map((s, idx) => {
                          const key = `${phase.id}-${idx}`;
                          const isExpanded = expandedSensations[key];

                          return (
                            <div
                              key={key}
                              className={`sensation-dropdown ${
                                isExpanded ? "expanded" : ""
                              }`}
                            >
                              <button
                                className="sensation-header"
                                onClick={() => toggleSensation(key)}
                                aria-expanded={isExpanded}
                              >
                                <span className="sensation-question">
                                  ❓ {s.what}
                                </span>

                                <span className="dropdown-arrow">
                                  {isExpanded ? "▼" : "▶"}
                                </span>
                              </button>

                              {isExpanded && (
                                <div className="sensation-content">
                                  <p className="sensation-why">
                                    <strong>Why this happens:</strong>{" "}
                                    {s.why}
                                  </p>

                                  <p className="sensation-normal">
                                    <span className="normal-badge">
                                      ✅ {s.isNormal}
                                    </span>
                                  </p>

                                  <p className="sensation-detail">
                                    {s.detail}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {!selectedPhase && (
              <div className="guide-instructions">
                <div className="instruction-card">
                  <h3>🛫 How to Use This Guide</h3>
                  <ul>
                    <li>
                      <strong>During flight:</strong> Search or tap a phase to
                      understand what you’re feeling.
                    </li>
                    <li>
                      <strong>Before flight:</strong> Review phases to know
                      what to expect.
                    </li>
                    <li>
                      <strong>Everything listed here is normal</strong> and
                      part of safe flight operations.
                    </li>
                  </ul>
                </div>

                <div className="reassurance-box">
                  <h3>🤝 Quick Reassurance</h3>

                  <div className="reassurance-items">
                    <div className="reassurance-item">
                      <span className="reassurance-icon">🛡️</span>
                      <p>
                        <strong>Aircraft are incredibly strong.</strong>{" "}
                        They’re tested far beyond real-world turbulence.
                      </p>
                    </div>

                    <div className="reassurance-item">
                      <span className="reassurance-icon">👨‍✈️</span>
                      <p>
                        <strong>Pilots are highly trained.</strong> They
                        practice every scenario regularly.
                      </p>
                    </div>

                    <div className="reassurance-item">
                      <span className="reassurance-icon">📊</span>
                      <p>
                        <strong>Flying is extremely safe.</strong> It’s the
                        safest form of long-distance travel.
                      </p>
                    </div>

                    <div className="reassurance-item">
                      <span className="reassurance-icon">🔧</span>
                      <p>
                        <strong>Aircraft are constantly inspected.</strong>{" "}
                        Certified technicians maintain every system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default RealTimeGuide;

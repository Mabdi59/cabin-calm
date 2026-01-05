import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { flightsAPI } from "../services/api";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import SearchableSelect from "../components/SearchableSelect";
import styles from "./FlightForm.module.css";

function FlightForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? 'Edit Flight' : 'Add Flight');

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    flight_date: getTodayDate(),
    airline: "",
    departure_airport: "",
    arrival_airport: "",
    flight_time: "",
    weather: "",
    seat_position: "",
    seat_location: "",
    turbulence: "none",
    anxiety_level: 5,
    triggers: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingFlight, setLoadingFlight] = useState(false);
  const [error, setError] = useState("");

  const loadFlight = async () => {
    if (!isEdit) return;

    try {
      setLoadingFlight(true);
      const res = await flightsAPI.getOne(id);

      // Merge with defaults to avoid missing keys breaking bindings
      setFormData((prev) => ({
        ...prev,
        ...res.data,
        anxiety_level: Number(res.data?.anxiety_level ?? 5),
      }));
    } catch (err) {
      console.error("Failed to load flight:", err);
      setError("Unable to load flight details. Please try again.");
    } finally {
      setLoadingFlight(false);
    }
  };

  useEffect(() => {
    loadFlight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "anxiety_level" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEdit) {
        await flightsAPI.update(id, formData);
      } else {
        await flightsAPI.create(formData);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Save failed:", err);
      setError(err.response?.data?.error || "Unable to save your flight. Please check your information and try again.");
    } finally {
      setLoading(false);
    }
  };

  const commonTriggers = [
    "Engine sounds",
    "Turbulence",
    "Takeoff",
    "Landing",
    "Descent",
    "Climb",
    "Banking / turning",
    "Go-around",
    "Delayed descent",
    "Weather",
    "Cabin noises",
    "Captain announcements",
  ];

  const airlineOptions = [
    { value: "", label: "Select airline..." },
    { value: "American Airlines", label: "American Airlines" },
    { value: "Delta Air Lines", label: "Delta Air Lines" },
    { value: "United Airlines", label: "United Airlines" },
    { value: "Southwest Airlines", label: "Southwest Airlines" },
    { value: "JetBlue Airways", label: "JetBlue Airways" },
    { value: "Alaska Airlines", label: "Alaska Airlines" },
    { value: "Spirit Airlines", label: "Spirit Airlines" },
    { value: "Frontier Airlines", label: "Frontier Airlines" },
    { value: "Hawaiian Airlines", label: "Hawaiian Airlines" },
    { value: "British Airways", label: "British Airways" },
    { value: "Lufthansa", label: "Lufthansa" },
    { value: "Air France", label: "Air France" },
    { value: "Emirates", label: "Emirates" },
    { value: "Qatar Airways", label: "Qatar Airways" },
    { value: "Singapore Airlines", label: "Singapore Airlines" },
    { value: "Other", label: "Other" },
  ];

  const airportOptions = [
    { value: "", label: "Select airport..." },
    { value: "ATL", label: "ATL — Atlanta" },
    { value: "LAX", label: "LAX — Los Angeles" },
    { value: "ORD", label: "ORD — Chicago O'Hare" },
    { value: "DFW", label: "DFW — Dallas-Fort Worth" },
    { value: "DEN", label: "DEN — Denver" },
    { value: "JFK", label: "JFK — New York JFK" },
    { value: "SFO", label: "SFO — San Francisco" },
    { value: "SEA", label: "SEA — Seattle" },
    { value: "LAS", label: "LAS — Las Vegas" },
    { value: "MCO", label: "MCO — Orlando" },
    { value: "IAD", label: "IAD — Washington Dulles" },
    { value: "LHR", label: "LHR — London Heathrow" },
    { value: "CDG", label: "CDG — Paris" },
    { value: "DXB", label: "DXB — Dubai" },
  ];

  const weatherOptions = [
    { value: "", label: "Select weather..." },
    { value: "Clear", label: "Clear / Sunny" },
    { value: "Partly Cloudy", label: "Partly Cloudy" },
    { value: "Cloudy", label: "Cloudy / Overcast" },
    { value: "Rainy", label: "Rainy" },
    { value: "Stormy", label: "Stormy / Thunderstorms" },
    { value: "Foggy", label: "Foggy" },
    { value: "Snowy", label: "Snowy" },
    { value: "Windy", label: "Windy" },
  ];

  const addTrigger = (trigger) => {
    const current = formData.triggers || "";

    const list = current
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!list.includes(trigger)) {
      list.push(trigger);
    }

    setFormData((prev) => ({
      ...prev,
      triggers: list.join(", "),
    }));
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
        <div className="form-container">
          <h2>{isEdit ? "Edit Flight" : "Log New Flight"}</h2>

          {error && <div className="error-message">{error}</div>}

          {loadingFlight ? (
            <div className="loading">Loading flight…</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="flight_date">Flight Date *</label>
                  <input
                    type="date"
                    id="flight_date"
                    name="flight_date"
                    value={formData.flight_date || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="flight_time">Flight Time *</label>
                  <input
                    type="time"
                    id="flight_time"
                    name="flight_time"
                    value={formData.flight_time || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <SearchableSelect
                  id="airline"
                  name="airline"
                  value={formData.airline}
                  onChange={handleChange}
                  options={airlineOptions}
                  label="Airline *"
                  placeholder="Search or select airline..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <SearchableSelect
                    id="departure_airport"
                    name="departure_airport"
                    value={formData.departure_airport}
                    onChange={handleChange}
                    options={airportOptions}
                    label="From (Departure) *"
                    placeholder="Search departure airport..."
                    required
                  />
                </div>

                <div className="form-group">
                  <SearchableSelect
                    id="arrival_airport"
                    name="arrival_airport"
                    value={formData.arrival_airport}
                    onChange={handleChange}
                    options={airportOptions}
                    label="To (Arrival) *"
                    placeholder="Search arrival airport..."
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="seat_position">Seat Position</label>
                  <select
                    id="seat_position"
                    name="seat_position"
                    value={formData.seat_position || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="window">Window</option>
                    <option value="middle">Middle</option>
                    <option value="aisle">Aisle</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="seat_location">Seat Location</label>
                  <select
                    id="seat_location"
                    name="seat_location"
                    value={formData.seat_location || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="front">Front of plane</option>
                    <option value="middle">Middle of plane</option>
                    <option value="back">Back of plane</option>
                    <option value="overwing">Over wing</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <SearchableSelect
                    id="weather"
                    name="weather"
                    value={formData.weather}
                    onChange={handleChange}
                    options={weatherOptions}
                    label="Weather Conditions"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="turbulence">Turbulence Level *</label>
                  <select
                    id="turbulence"
                    name="turbulence"
                    value={formData.turbulence}
                    onChange={handleChange}
                    required
                  >
                    <option value="none">None</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="anxiety_level">
                  Anxiety Level: {formData.anxiety_level}/10 *
                </label>

                <input
                  type="range"
                  id="anxiety_level"
                  name="anxiety_level"
                  min="1"
                  max="10"
                  value={formData.anxiety_level}
                  onChange={handleChange}
                  className="anxiety-slider"
                />

                <div className="anxiety-scale">
                  <span>Low (1)</span>
                  <span>High (10)</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="triggers">Anxiety Triggers</label>

                <div className="triggers-help">
                  Common triggers (tap to add):
                </div>

                <div className="trigger-chips">
                  {commonTriggers.map((trigger) => (
                    <button
                      key={trigger}
                      type="button"
                      className="trigger-chip"
                      onClick={() => addTrigger(trigger)}
                    >
                      + {trigger}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  id="triggers"
                  name="triggers"
                  value={formData.triggers || ""}
                  onChange={handleChange}
                  placeholder="Comma-separated list of triggers"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleChange}
                  placeholder="Any additional details about the flight..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading
                    ? "Saving..."
                    : isEdit
                    ? "Update Flight"
                    : "Log Flight"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlightForm;

import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const BASE_URL = "http://localhost:8080/api/notes";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const response = await axios.get(BASE_URL);
    setNotes(response.data);
  };

  const handleSearch = async (value) => {
    setSearch(value);
    if (value.trim() === "") {
      fetchNotes();
    } else {
      const response = await axios.get(
        `${BASE_URL}/search?keyword=${value}`
      );
      setNotes(response.data);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    if (editingId) {
      await axios.put(`${BASE_URL}/${editingId}`, { title, content });
    } else {
      await axios.post(BASE_URL, { title, content });
    }
    setTitle("");
    setContent("");
    setEditingId(null);
    fetchNotes();
  };

  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${BASE_URL}/${id}`);
    fetchNotes();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className={`app-layout ${darkMode ? "dark" : "light"}`}>

      {/* ── LEFT PANEL ── */}
      <div className="left-panel">
        <div className="header">
          <div className="header-text">
            <h1>My Notes</h1>
            <p>Your thoughts, organised</p>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>

        <div className="note-form">
          <div className="form-title">
            {editingId ? "Editing note" : "New note"}
          </div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="form-actions">
            <button className="btn-primary" onClick={handleSubmit}>
              {editingId ? "Update Note" : "Add Note"}
            </button>
            {editingId && (
              <button className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-number">{notes.length}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {search ? notes.length : "--"}
            </div>
            <div className="stat-label">Results</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {notes.length > 0
                ? new Date(
                    Math.max(...notes.map((n) => new Date(n.createdAt)))
                  ).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short",
                  })
                : "--"}
            </div>
            <div className="stat-label">Latest</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="right-panel">
        <div className="search-wrapper">
          <span className="search-icon">&#128269;</span>
          <input
            type="text"
            className="search-bar"
            placeholder="Search notes by title or content..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="section-label">
          {search ? `Results for "${search}"` : "All notes"}
        </div>

        {notes.length === 0 ? (
          <div className="no-notes">
            <div className="no-notes-icon">&#128221;</div>
            <p>
              {search
                ? "No notes match your search."
                : "No notes yet. Add your first one on the left!"}
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div className="note-card" key={note.id}>
                <div className="note-card-header">
                  <h3>{note.title}</h3>
                  <div className="note-dot"></div>
                </div>
                <p>{note.content}</p>
                <div className="date">{formatDate(note.createdAt)}</div>
                <div className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(note)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(note.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useRef } from "react";
import "./DiscoveryCredentials.css";

export default function CredentialsStep({ onSubmit }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [savedUsers, setSavedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [credentialsSaved, setCredentialsSaved] = useState(false);
  const timerRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, password } = form;
    console.log("Credentials envoyés:", form);
    if (username && password) {
      onSubmit(form); // <-- Passe le mot de passe en clair

      // Détecte si le login existe déjà
      const alreadyExists = savedUsers.includes(form.username);
      setSavedUsers(prev =>
        alreadyExists ? prev : [...prev, form.username]
      );
      setMessage(
        alreadyExists
          ? <>Credentials <b>Updated</b></>
          : "Credentials Saved"
      );
      setCredentialsSaved(true);

      // Efface le message après 3 secondes
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setMessage(""), 3000);

      setForm({ ...form, password: "" });
    }
  };

  return (
    <div>
      <div className="credentials-header">
        <h3 className="h3 is-4" style={{ margin: 0 }}>Credentials</h3>
        {message && (
          <div className="credentials-message">
            {message}
          </div>
        )}
      </div>
      <span className={`stepNumber${credentialsSaved ? " completed" : ""}`}>2</span>
      <form className="credentials-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
        />
        <button type="submit" className="btn btn-sm btn-primary">
          Validate
        </button>
      </form>
    </div>
  );
}
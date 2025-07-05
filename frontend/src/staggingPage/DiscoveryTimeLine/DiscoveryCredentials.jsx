import React, { useState, useRef } from "react";
import "./DiscoveryCredentials.css";

export default function CredentialsStep({ onSubmit }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [savedUsers, setSavedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [credentialsSaved, setCredentialsSaved] = useState(false);
  const timerRef = useRef(null);

  // Hash le mot de passe en SHA-256 (Web Crypto API)
  async function hashPassword(pwd) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hashedPassword = await hashPassword(password);
    onSubmit({ username, password: hashedPassword });

    // Détecte si le login existe déjà
    const alreadyExists = savedUsers.includes(username);
    setSavedUsers(prev =>
      alreadyExists ? prev : [...prev, username]
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

    setPassword("");
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
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-sm btn-primary">
          Validate
        </button>
      </form>
    </div>
  );
}
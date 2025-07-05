import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp?: string;
}

const SendIcon = ({ disabled }: { disabled: boolean }) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill={disabled ? '#b0b0b0' : '#6366f1'}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <path d="M2 21l21-9-21-9v7l15 2-15 2v7z" />
  </svg>
);

const UserAvatar = () => (
  <div className="avatar user-avatar">
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#6366f1"/>
      <path d="M18 18c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm0 3c-4.418 0-12 2.21-12 6.6V30h24v-2.4c0-4.39-7.582-6.6-12-6.6z" fill="#fff"/>
    </svg>
  </div>
);

const BotAvatar = () => (
  <div className="avatar bot-avatar">
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#fbbf24"/>
      <rect x="10" y="14" width="16" height="10" rx="5" fill="#fff"/>
      <rect x="14" y="10" width="8" height="8" rx="4" fill="#fff"/>
      <circle cx="15.5" cy="19" r="1.5" fill="#6366f1"/>
      <circle cx="20.5" cy="19" r="1.5" fill="#6366f1"/>
    </svg>
  </div>
);

const LogoutIcon = () => (
  <svg className="logout-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 17l5-5-5-5M21 12H9M13 21H5a2 2 0 01-2-2V5a2 2 0 012-2h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Login({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Reset form when component mounts (e.g., after logout)
  useEffect(() => {
    setUsername("");
    setPassword("");
    setError("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      onLogin(username);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, gap: 12 }}>
          <span style={{ fontSize: 44 }}>🤖</span>
          <h2 style={{ fontWeight: 700, fontSize: '1.6rem', color: '#1e3a8a', margin: 0, letterSpacing: 1 }}>
            Welcome
          </h2>
        </div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => {
            setUsername(e.target.value);
            setError("");
          }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            setError("");
          }}
          required
        />
        <button type="submit">Login</button>
        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  );
}

function Chat({ username, onLogout }: { username: string; onLogout: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Reset messages when username changes
  useEffect(() => {
    setMessages([]);
  }, [username]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, loading]);

  // Fetch chat history after login
  useEffect(() => {
    if (username) {
      fetch(`http://127.0.0.1:8000/history/${username}`)
        .then(res => res.json())
        .then((history) => {
          // Add timestamps for display (optional)
          setMessages(history.map((msg: any) => ({
            sender: msg.role,
            text: msg.text,
            timestamp: '' // No timestamp in backend history
          })));
        });
    }
  }, [username]);

  // Send chat message
  const sendMessage = async () => {
    if (!input.trim() || !username) return;
    const now = new Date();
    const userMessage: Message = { sender: 'user', text: input, timestamp: formatTime(now) };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message: input }),
      });
      const data = await response.json();
      const botNow = new Date();
      setMessages((msgs) => [
        ...msgs,
        { sender: 'bot', text: data.response, timestamp: formatTime(botNow) },
      ]);
    } catch (error) {
      const botNow = new Date();
      setMessages((msgs) => [
        ...msgs,
        { sender: 'bot', text: 'Erreur de connexion au serveur.', timestamp: formatTime(botNow) },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <UserAvatar />
          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>
            👋 Welcome back, {username.charAt(0).toUpperCase() + username.slice(1)}!
          </span>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout" aria-label="Logout" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <LogoutIcon />
        </button>
      </div>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.length === 0 && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            Posez votre question informatique ici !
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sender === 'user' ? 'user-msg msg-row' : 'bot-msg msg-row'}>
            {msg.sender === 'bot' && <BotAvatar />}
            <div className="msg-text">
              {msg.text}
              {msg.timestamp && (
                <div style={{ fontSize: '0.82rem', color: '#a1a1aa', marginTop: 6, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                  {msg.timestamp}
                </div>
              )}
            </div>
            {msg.sender === 'user' && <UserAvatar />}
          </div>
        ))}
        {loading && (
          <div className="bot-msg msg-row">
            <BotAvatar />
            <div className="msg-text typing-indicator">
              <span>Bot is typing</span>
              <span className="typing-dots">...</span>
            </div>
          </div>
        )}
      </div>
      <div className="input-row">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre question..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="send-btn"
          aria-label="Envoyer"
        >
          <SendIcon disabled={loading || !input.trim()} />
        </button>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);

  return (
    <>
      {!username ? (
        <Login key="login" onLogin={setUsername} />
      ) : (
        <Chat key={username} username={username} onLogout={() => setUsername(null)} />
      )}
    </>
  );
};

export default App; 
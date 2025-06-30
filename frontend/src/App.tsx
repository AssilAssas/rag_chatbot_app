import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
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

const Avatar = ({ sender }: { sender: 'user' | 'bot' }) => (
  <div className={sender === 'user' ? 'avatar user-avatar' : 'avatar bot-avatar'}>
    {sender === 'user' ? 'U' : 'B'}
  </div>
);

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const now = new Date();
    const userMessage: Message = { sender: 'user', text: input, timestamp: formatTime(now) };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
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
      <div className="header">
        <div className="header-logo" />
        <span className="header-text">Ask IT!</span>
      </div>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.length === 0 && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            Posez votre question informatique ici !
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sender === 'user' ? 'user-msg msg-row' : 'bot-msg msg-row'}>
            {msg.sender === 'bot' && <Avatar sender="bot" />}
            <div className="msg-text">
              {msg.text}
              <div style={{ fontSize: '0.82rem', color: '#a1a1aa', marginTop: 6, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                {msg.timestamp}
              </div>
            </div>
            {msg.sender === 'user' && <Avatar sender="user" />}
          </div>
        ))}
        {loading && (
          <div className="bot-msg msg-row">
            <Avatar sender="bot" />
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
};

export default App; 
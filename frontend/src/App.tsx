import { useCallback, useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './App.css';

interface User {
  id: number;
  email: string;
  name: string;
}

interface Idea {
  id: number;
  title: string;
  description: string;
  user_id: number;
  user_name: string;
  pledge_amount: number;
  comment_count: number;
  created_at: string;
}

interface Comment {
  id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
}

const renderMarkdown = (text: string): string => {
  const html = marked.parse(text, { async: false }) as string;
  return DOMPurify.sanitize(html);
};

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'register' | 'main'>('main');

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null);
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pledgeAmount, setPledgeAmount] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return await fetch(url, { ...options, headers });
  }, [token]);

  const fetchIdeas = useCallback(async () => {
    try {
      const url = searchQuery ? `/api/ideas?q=${encodeURIComponent(searchQuery)}` : '/api/ideas';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    }
  }, [searchQuery]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await apiCall('/api/users/me');
      if (res.ok) {
        setUser(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  }, [apiCall]);

  const fetchIdeaDetails = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/ideas/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(prev => ({ ...prev, [id]: data.comments || [] }));
      }
    } catch (err) {
      console.error('Failed to fetch idea details:', err);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setView('main');
        setEmail('');
        setPassword('');
      } else {
        const err = await res.json();
        setError(err.error || 'Login failed');
      }
    } catch {
      setError('Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setView('main');
        setEmail('');
        setPassword('');
        setName('');
      } else {
        const err = await res.json();
        setError(err.error || 'Registration failed');
      }
    } catch {
      setError('Registration failed');
    }
  };

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const pledge = pledgeAmount ? parseFloat(pledgeAmount) : 0;
      const res = await apiCall('/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ title, description, pledge_amount: pledge }),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setPledgeAmount('');
        setShowNewIdea(false);
        setMessage('Idea created!');
        fetchIdeas();
      } else {
        const err = await res.json();
        setError(err.error);
      }
    } catch {
      setError('Failed to create idea');
    }
  };

  const handleAddComment = async (ideaId: number, text: string) => {
    if (!text.trim()) return;

    try {
      const res = await apiCall(`/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        fetchIdeaDetails(ideaId);
        return true;
      }
    } catch {
      setError('Failed to add comment');
    }
    return false;
  };

  const toggleIdea = (ideaId: number) => {
    if (expandedIdea === ideaId) {
      setExpandedIdea(null);
    } else {
      setExpandedIdea(ideaId);
      if (!comments[ideaId]) {
        fetchIdeaDetails(ideaId);
      }
    }
  };

  if (view === 'login') {
    return (
      <div className="container">
        <div className="auth-box">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button type="submit">Login</button>
          </form>
          <p>
            No account? <button onClick={() => setView('register')} className="link-button">Register</button>
          </p>
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="container">
        <div className="auth-box">
          <h1>Register</h1>
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button type="submit">Register</button>
          </form>
          <p>
            Have an account? <button onClick={() => setView('login')} className="link-button">Login</button>
          </p>
        </div>
      </div>
    );
  }

  const IdeaCard = ({ idea }: { idea: Idea }) => {
    const isExpanded = expandedIdea === idea.id;
    const ideaComments = comments[idea.id] || [];
    const [newComment, setNewComment] = useState('');

    const submitComment = async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await handleAddComment(idea.id, newComment);
      if (success) setNewComment('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent;
        submitComment(formEvent);
      }
    };

    return (
      <div className="idea-card">
        <div onClick={() => toggleIdea(idea.id)} style={{ cursor: 'pointer' }}>
          <h3 dangerouslySetInnerHTML={{ __html: renderMarkdown(idea.title) }} />
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(idea.description) }} />
          <div className="idea-meta">
            <span>by {idea.user_name}</span>
            {idea.pledge_amount > 0 && <span>${idea.pledge_amount.toFixed(2)} pledged</span>}
            <span>{idea.comment_count} comments</span>
            <span>{new Date(idea.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="conversation" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
            <h4>Discussion</h4>
            {user ? (
              <form onSubmit={submitComment} className="comment-form">
                <textarea
                  placeholder="Share your thoughts... (Ctrl+Enter to submit)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  required
                />
                <button type="submit">Comment</button>
              </form>
            ) : (
              <p className="empty">
                <button onClick={() => setView('login')} className="link-button">Sign in</button> to join the discussion
              </p>
            )}
            <div className="comments">
              {ideaComments.map((comment) => (
                <div key={comment.id} className="comment">
                  <strong>{comment.user_name}</strong>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.content) }} />
                  <span className="time">{new Date(comment.created_at).toLocaleString()}</span>
                </div>
              ))}
              {ideaComments.length === 0 && !user && <p className="empty">No comments yet.</p>}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <header>
        <h1>IdeaHub</h1>
        {user ? (
          <div>
            <span>Welcome, {user.name}!</span>
            <button onClick={() => { localStorage.removeItem('token'); setToken(null); setUser(null); }}>Logout</button>
          </div>
        ) : (
          <div>
            <button onClick={() => setView('login')}>Login</button>
            <button onClick={() => setView('register')}>Register</button>
          </div>
        )}
      </header>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="search-box">
        <input
          type="text"
          placeholder="Search ideas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {user && (
          <button
            onClick={() => setShowNewIdea(!showNewIdea)}
            style={{ marginTop: '10px' }}
          >
            {showNewIdea ? 'Cancel' : 'Share Idea'}
          </button>
        )}
      </div>

      {user && showNewIdea && (
        <section>
          <h2>Share an Idea</h2>
          <form onSubmit={handleCreateIdea}>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea
              placeholder="Description (Ctrl+Enter to submit)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent;
                  handleCreateIdea(formEvent);
                }
              }}
              required
            />
            <input
              type="number"
              placeholder="Pledge amount (optional)"
              value={pledgeAmount}
              onChange={(e) => setPledgeAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            <button type="submit">Share</button>
          </form>
        </section>
      )}

      <section>
        <h2>Ideas</h2>
        <div className="ideas-list">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
          {ideas.length === 0 && <p className="empty">No ideas found. Be the first to share one!</p>}
        </div>
      </section>
    </div>
  );
}

export default App;

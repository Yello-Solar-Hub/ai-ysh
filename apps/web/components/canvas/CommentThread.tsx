import React, {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { nanoid } from 'nanoid';
import { format } from 'date-fns';

interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string; // ISO string for persistence
}

interface StoredThread {
  resolved: boolean;
  comments: Comment[];
}

interface CommentThreadProps {
  /** unique id used for persistence */
  threadId: string;
  /** name of the current user adding comments */
  currentUser: string;
  /** filter by thread state */
  filter?: 'all' | 'open' | 'resolved';
}

/**
 * CommentThread displays a list of comments with basic collaboration tools.
 * - create, edit and delete comments
 * - @mention highlighting
 * - resolve / reopen thread
 * - persisted in localStorage
 */
export function CommentThread({
  threadId,
  currentUser,
  filter = 'all',
}: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [resolved, setResolved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Load thread from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`thread:${threadId}`);
      if (raw) {
        const data: StoredThread = JSON.parse(raw);
        setComments(data.comments);
        setResolved(data.resolved);
      }
    } catch {
      // ignore parse errors
    }
  }, [threadId]);

  // Persist thread
  useEffect(() => {
    const data: StoredThread = { comments, resolved };
    localStorage.setItem(`thread:${threadId}`, JSON.stringify(data));
  }, [comments, resolved, threadId]);

  // focus edit input when entering edit mode
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleAdd = () => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: nanoid(),
      author: currentUser,
      text,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
    setText('');
    inputRef.current?.focus();
  };

  const startEdit = (id: string) => {
    const c = comments.find((cm) => cm.id === id);
    if (!c) return;
    setEditingId(id);
    setEditingText(c.text);
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
  };

  const saveEdit = (id: string) => {
    setComments((prev) =>
      prev.map((cm) =>
        cm.id === id ? { ...cm, text: editingText } : cm,
      ),
    );
    setEditingId(null);
    setEditingText('');
  };

  const deleteComment = (id: string) => {
    setComments((prev) => prev.filter((cm) => cm.id !== id));
  };

  const toggleResolved = () => setResolved((r) => !r);

  const renderText = (t: string) =>
    t.split(/(@\w+)/g).map((part) =>
      part.startsWith('@') ? (
        <span
          key={`mention-${part}-${nanoid()}`}
          className="text-blue-600"
          data-testid="mention"
        >
          {part}
        </span>
      ) : (
        <span key={`text-${part}-${nanoid()}`}>{part}</span>
      ),
    );

  if (filter === 'open' && resolved) return null;
  if (filter === 'resolved' && !resolved) return null;

  return (
    <div className="space-y-2" aria-label="comment thread">
      <div className="flex items-center justify-between">
        <span className="text-sm" aria-live="polite">
          {resolved ? 'Thread resolved' : 'Thread open'}
        </span>
        <button
          type="button"
          onClick={toggleResolved}
          aria-label="Resolve thread"
          className="text-xs underline"
        >
          {resolved ? 'Reopen' : 'Resolve'}
        </button>
      </div>
      <ul className="space-y-2" aria-label="Comments">
        {comments.map((c) => (
          <li key={c.id} className="text-sm flex gap-2" >
            <span className="font-medium">{c.author}</span>
            {editingId === c.id ? (
              <>
                <input
                  ref={editInputRef}
                  value={editingText}
                  onChange={handleEditChange}
                  aria-label="Edit comment"
                  className="border rounded px-1"
                />
                <button
                  type="button"
                  onClick={() => saveEdit(c.id)}
                  aria-label="Save"
                  className="text-xs underline"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span>{renderText(c.text)}</span>
                <span className="text-xs text-gray-500">
                  {format(new Date(c.createdAt), 'PP p')}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(c.id)}
                  aria-label="Edit comment"
                  className="text-xs underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteComment(c.id)}
                  aria-label="Delete comment"
                  className="text-xs underline"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      {!resolved && (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border rounded px-2 py-1"
            aria-label="Add comment"
          />
          <button
            type="button"
            onClick={handleAdd}
            aria-label="Add comment"
            className="text-xs underline"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export type { Comment };


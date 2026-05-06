import { useRef, useState } from 'react';
import { useConversation } from '../../hooks/useConversation';
import './styles.scss';

const Sidebar = () => {
  const {
    conversations,
    currentId,
    createConversation,
    selectConversation,
    deleteConversation,
    updateTitle,
  } = useConversation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const skipNextBlurRef = useRef(false);

  const startEditing = (id: string, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const saveTitle = async (id: string, currentTitle: string) => {
    const title = editingTitle.trim();
    if (!title || pendingId === id) return;
    if (title === currentTitle) {
      cancelEditing();
      return;
    }

    setPendingId(id);
    try {
      await updateTitle(id, title);
      cancelEditing();
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个对话吗？')) return;

    setPendingId(id);
    try {
      await deleteConversation(id);
      if (editingId === id) {
        cancelEditing();
      }
    } finally {
      setPendingId(null);
    }
  };

  return (
    <aside className="sidebar">
      <button className="sidebar__new-btn" onClick={() => createConversation()}>
        + 新对话
      </button>

      <div className="sidebar__list">
        {conversations.map((conv) => {
          const isEditing = editingId === conv.id;
          const isPending = pendingId === conv.id;

          return (
            <div
              key={conv.id}
              className={`sidebar__item ${conv.id === currentId ? 'sidebar__item--active' : ''}`}
              onClick={() => {
                if (!isEditing) {
                  selectConversation(conv.id);
                }
              }}
            >
              {isEditing ? (
                <input
                  className="sidebar__item-input"
                  value={editingTitle}
                  autoFocus
                  disabled={isPending}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={() => {
                    if (skipNextBlurRef.current) {
                      skipNextBlurRef.current = false;
                      return;
                    }
                    saveTitle(conv.id, conv.title);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      skipNextBlurRef.current = true;
                      saveTitle(conv.id, conv.title);
                    }
                    if (e.key === 'Escape') {
                      skipNextBlurRef.current = true;
                      cancelEditing();
                    }
                  }}
                />
              ) : (
                <span
                  className="sidebar__item-title"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startEditing(conv.id, conv.title);
                  }}
                >
                  {conv.title}
                </span>
              )}

              <div className="sidebar__item-actions">
                {!isEditing && (
                  <button
                    className="sidebar__item-action"
                    disabled={isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(conv.id, conv.title);
                    }}
                  >
                    重命名
                  </button>
                )}
                <button
                  className="sidebar__item-action sidebar__item-action--danger"
                  disabled={isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(conv.id);
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;

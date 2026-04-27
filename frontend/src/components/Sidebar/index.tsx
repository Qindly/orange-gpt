import { useConversation } from '../../hooks/useConversation';
import './styles.scss';

const Sidebar = () => {
  const {
    conversations,
    currentId,
    createConversation,
    selectConversation,
    deleteConversation,
  } = useConversation();

  return (
    <aside className="sidebar">
      <button className="sidebar__new-btn" onClick={() => createConversation()}>
        + 新对话
      </button>

      <div className="sidebar__list">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`sidebar__item ${conv.id === currentId ? 'sidebar__item--active' : ''}`}
            onClick={() => selectConversation(conv.id)}
          >
            <span className="sidebar__item-title">{conv.title}</span>
            <button
              className="sidebar__item-delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(conv.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
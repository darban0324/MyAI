function Sidebar({ page, setPage, newChat }) {
  return (
    <aside className="sidebar">

      <div className="logo">
        ✦ MY AI
      </div>

      <button
  className="newChat"
  onClick={newChat}
>
  ＋ New Chat
</button>,

      <nav>

        <div className="navItem active">
          💬 Chat
        </div>

        <div className="navItem">
          🔗 Workflow
        </div>

        <div className="navItem">
          🧠 Memory
        </div>

        <div className="navItem">
          ⚙️ Settings
        </div>

      </nav>

      <div className="sidebarBottom">

        <div className="navItem">
          📁 Projects
        </div>

        <div className="navItem">
          ❓ Help
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;

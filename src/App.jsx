import { useState, useEffect } from "react";
import "./App.css";

const languages = [
  { name: "Auto", code: "auto" },
  { name: "اردو", code: "ur-PK" },
  { name: "English", code: "en-US" },
  { name: "हिन्दी", code: "hi-IN" },
  { name: "العربية", code: "ar-SA" },
  { name: "فارسی", code: "fa-IR" },
  { name: "বাংলা", code: "bn-BD" },
  { name: "Türkçe", code: "tr-TR" },
  { name: "Français", code: "fr-FR" },
  { name: "Español", code: "es-ES" },
  { name: "Deutsch", code: "de-DE" },
  { name: "Italiano", code: "it-IT" },
  { name: "Português", code: "pt-BR" },
  { name: "Русский", code: "ru-RU" },
  { name: "中文", code: "zh-CN" },
  { name: "日本語", code: "ja-JP" },
  { name: "한국어", code: "ko-KR" },
  { name: "தமிழ்", code: "ta-IN" },
  { name: "తెలుగు", code: "te-IN" },
  { name: "ਪੰਜਾਬੀ", code: "pa-IN" },
  { name: "मराठी", code: "mr-IN" },
  { name: "ગુજરાતી", code: "gu-IN" },
  { name: "ಕನ್ನಡ", code: "kn-IN" },
  { name: "മലയാളം", code: "ml-IN" },
  { name: "ไทย", code: "th-TH" },
  { name: "Tiếng Việt", code: "vi-VN" },
  { name: "Bahasa Indonesia", code: "id-ID" },
  { name: "Nederlands", code: "nl-NL" },
  { name: "Polski", code: "pl-PL" },
  { name: "Українська", code: "uk-UA" },
];

function App() {
  const [page, setPage] = useState("chat");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("auto");
  const [listening, setListening] = useState(false);

  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem("myai_chats");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    try {
      return localStorage.getItem("myai_active_chat") || null;
    } catch {
      return null;
    }
  });

  const messages =
    chats.find((chat) => chat.id === activeChatId)?.messages || [];

  useEffect(() => {
    localStorage.setItem("myai_chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem("myai_active_chat", activeChatId);
    }
  }, [activeChatId]);

  const newChat = () => {
    const id =
      Date.now().toString() +
      Math.random().toString(36).slice(2);

    const chat = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };

    setChats((oldChats) => [chat, ...oldChats]);
    setActiveChatId(id);
    setPage("chat");
    setMessage("");
  };

  const openChat = (id) => {
    setActiveChatId(id);
    setPage("chat");
    setMessage("");
  };

  const deleteChat = (id, event) => {
    event.stopPropagation();

    setChats((oldChats) =>
      oldChats.filter((chat) => chat.id !== id)
    );

    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  const handleSend = async () => {
    const text = message.trim();

    if (!text || loading) return;

    let chatId = activeChatId;

    if (!chatId) {
      chatId =
        Date.now().toString() +
        Math.random().toString(36).slice(2);

      const newChatData = {
        id: chatId,
        title: text.slice(0, 35),
        messages: [],
        createdAt: Date.now(),
      };

      setChats((oldChats) => [
        newChatData,
        ...oldChats,
      ]);

      setActiveChatId(chatId);
    }

    const currentChat = chats.find(
      (chat) => chat.id === chatId
    );

    const oldMessages =
      currentChat?.messages || [];

    const userMessage = {
      type: "user",
      text: text,
    };

    const updatedMessages = [
      ...oldMessages,
      userMessage,
    ];

    setChats((oldChats) =>
      oldChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title:
                chat.messages.length === 0
                  ? text.slice(0, 35)
                  : chat.title,
              messages: updatedMessages,
            }
          : chat
      )
    );

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3001/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "AI response failed"
        );
      }

      const aiMessage = {
        type: "ai",
        text: data.reply,
      };

      setChats((oldChats) =>
        oldChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  aiMessage,
                ],
              }
            : chat
        )
      );
    } catch (error) {
      const errorMessage = {
        type: "ai",
        text: "Error: " + error.message,
      };

      setChats((oldChats) =>
        oldChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  errorMessage,
                ],
              }
            : chat
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice recognition is not supported in this browser."
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      language === "auto"
        ? navigator.language || "en-US"
        : language;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setMessage("🎤 Listening...");
    };

    recognition.onresult = (event) => {
      setMessage(
        event.results[0][0].transcript
      );
    };

    recognition.onerror = (event) => {
      setListening(false);
      setMessage("");

      alert(
        "Voice error: " + event.error
      );
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="logo">
          MY AI
        </div>

        <button
          className="newChat"
          onClick={newChat}
        >
          ＋ New Chat
        </button>

        <nav>

          <div
            className={`navItem ${
              page === "chat" ? "active" : ""
            }`}
            onClick={() => setPage("chat")}
          >
            💬 Chat
          </div>

          <div
            className={`navItem ${
              page === "workflow"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setPage("workflow")
            }
          >
            🔗 Workflow
          </div>

          <div
            className={`navItem ${
              page === "memory"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setPage("memory")
            }
          >
            🧠 Memory
          </div>

          <div
            className={`navItem ${
              page === "settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setPage("settings")
            }
          >
            ⚙️ Settings
          </div>

        </nav>

        <div
          style={{
            marginTop: "18px",
            borderTop: "1px solid #263044",
            paddingTop: "10px",
            overflowY: "auto",
            maxHeight: "45vh",
          }}
        >

          <div
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              padding: "6px 10px 8px",
            }}
          >
            🕘 History
          </div>

          {chats.length === 0 ? (
            <div
              style={{
                color: "#64748b",
                fontSize: "12px",
                padding: "8px 10px",
              }}
            >
              No previous chats
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() =>
                  openChat(chat.id)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "9px 7px",
                  marginBottom: "4px",
                  borderRadius: "8px",
                  background:
                    chat.id === activeChatId
                      ? "#263449"
                      : "transparent",
                  color: "#cbd5e1",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >

                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  💬 {chat.title}
                </span>

                <button
                  onClick={(event) =>
                    deleteChat(
                      chat.id,
                      event
                    )
                  }
                  style={{
                    border: "0",
                    background: "transparent",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>

              </div>
            ))
          )}

        </div>

        <div className="sidebarBottom">

          <div className="navItem">
            📁 Projects
          </div>

          <div className="navItem">
            ❓ Help
          </div>

        </div>

      </aside>

      <main className="main">

        <header className="header">

          <div>

            <h1>
              {page === "chat" &&
                "My AI Assistant"}

              {page === "workflow" &&
                "AI Workflow"}

              {page === "memory" &&
                "Memory"}

              {page === "settings" &&
                "Settings"}
            </h1>

            <p>
              {page === "chat" &&
                "Your personal AI workspace"}

              {page === "workflow" &&
                "Build your own AI workflow"}

              {page === "memory" &&
                "Manage AI memory"}

              {page === "settings" &&
                "Configure your AI tool"}
            </p>

          </div>

        </header>

        {page === "chat" && (

          <section className="chatPage">

            {messages.length === 0 ? (

              <div className="welcome">

                <div className="aiIcon">
                  ✦
                </div>

                <h2>
                  How can I help you?
                </h2>

                <p>
                  Speak or type in your
                  preferred language.
                </p>

              </div>

            ) : (

              <div className="messages">

  {messages.map((item, index) => {

    const rtlLanguages = [
      "ur-PK",
      "ar-SA",
      "fa-IR",
    ];

    const isRTL =
      rtlLanguages.includes(language) ||
      /[\u0590-\u08FF]/.test(item.text);

    return (
      <div
        className={`messageBubble ${item.type}`}
        key={index}
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          textAlign: isRTL ? "right" : "left",
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        {item.text}
      </div>
    );
  })}

  {loading && (
    <div
      className="messageBubble ai"
      dir="rtl"
      style={{
        textAlign: "right",
      }}
    >
      سوچ رہا ہوں...
    </div>
  )}

</div>
 

            )}

            <div className="chatInput">

              <select
                value={language}
                onChange={(event) =>
                  setLanguage(
                    event.target.value
                  )
                }
                className="languageSelect"
              >

                {languages.map(
                  (item) => (

                    <option
                      key={item.code}
                      value={item.code}
                    >
                      🌐 {item.name}
                    </option>

                  )
                )}

              </select>

              <button
                className="voiceButton"
                onClick={handleVoice}
                disabled={
                  loading || listening
                }
                title="Voice input"
              >
                {listening
                  ? "🔴"
                  : "🎤"}
              </button>

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {

                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    handleSend();
                  }

                }}
                placeholder={
                  language === "ur-PK"
                    ? "اپنا پیغام لکھیں..."
                    : "Type your message..."
                }
              />

              <button
                className="sendButton"
                onClick={handleSend}
                disabled={loading}
              >
                {loading ? "..." : "➤"}
              </button>

            </div>

          </section>

        )}

        {page === "workflow" && (

          <section className="chatPage">

            <div className="welcome">

              <div className="aiIcon">
                🔗
              </div>

              <h2>
                AI Workflow
              </h2>

              <p>
                Build your own AI workflow.
              </p>

            </div>

          </section>

        )}

        {page === "memory" && (

          <section className="chatPage">

            <div className="welcome">

              <div className="aiIcon">
                🧠
              </div>

              <h2>
                Memory
              </h2>

              <p>
                Manage AI memory.
              </p>

            </div>

          </section>

        )}

        {page === "settings" && (

          <section className="chatPage">

            <div className="welcome">

              <div className="aiIcon">
                ⚙️
              </div>

              <h2>
                Settings
              </h2>

              <p>
                Configure your AI tool.
              </p>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default App;

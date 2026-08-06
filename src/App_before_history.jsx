import { useState } from "react";
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
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("auto");
  const [listening, setListening] = useState(false);

  const handleSend = async () => {
    const text = message.trim();

    if (!text || loading) return;

    setMessages((oldMessages) => [
      ...oldMessages,
      {
        type: "user",
        text: text,
      },
    ]);

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

      setMessages((oldMessages) => [
        ...oldMessages,
        {
          type: "ai",
          text: data.reply,
        },
      ]);
    } catch (error) {
      setMessages((oldMessages) => [
        ...oldMessages,
        {
          type: "ai",
          text: "Error: " + error.message,
        },
      ]);
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

    const recognition = new SpeechRecognition();

    if (language === "auto") {
      recognition.lang =
        navigator.language || "en-US";
    } else {
      recognition.lang = language;
    }

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setMessage("🎤 Listening...");
    };

    recognition.onresult = (event) => {
      const text =
        event.results[0][0].transcript;

      setMessage(text);
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

  const newChat = () => {
    setPage("chat");
    setMessages([]);
    setMessage("");
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
              page === "chat"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setPage("chat")
            }
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

                {messages.map(
                  (item, index) => (

                    <div
                      className={`messageBubble ${
                        item.type
                      }`}
                      key={index}
                    >
                      {item.text}
                    </div>

                  )
                )}

                {loading && (

                  <div className="messageBubble ai">
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
                {listening ? "🔴" : "🎤"}
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

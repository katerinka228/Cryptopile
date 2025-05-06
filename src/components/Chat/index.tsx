import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import { Button, Flex, Input, Tag, Typography } from "antd";
import styles from "./Chat.module.css";

const { Title, Text, Paragraph } = Typography;

type MessageType = {
  text: string;
  username?: string;
  timestamp?: string;
};

type SystemMessageType = {
  text: string;
  timestamp: string;
};

type ChatMessage = {
  type: "message" | "system";
  data: MessageType | SystemMessageType;
};

export default function Chat() {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const newSocket = io("ws://89.169.168.253:4500", {
      transports: ["websocket"],
      upgrade: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      setSocket(newSocket);
    });

    newSocket.on("message", (message: MessageType) => {
      setMessages((prev) => [...prev, { type: "message", data: message }]);
    });

    newSocket.on("system", (systemMessage: SystemMessageType) => {
      setMessages((prev) => [...prev, { type: "system", data: systemMessage }]);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
      setSocket(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = useCallback(() => {
    if (!socket || !inputText.trim()) return;
    if (inputText.startsWith("/name ")) {
      const newUsername = inputText.split(" ")[1];
      socket.emit("set_username", { username: newUsername });
      setUsername(newUsername);
    } else {
      if (!username) {
        alert("Сначала установите имя с помощью /name ВашеИмя");
        return;
      }
      socket.emit("message", { text: inputText });
    }
    setInputText("");
  }, [socket, inputText, username]);

  return (
      <div className={styles.chatContainer}>
        <Title level={2}>Chat</Title>

        <div className={styles.messageContainer}>
          {messages.map((msg, index) => (
              <div key={index} className={styles.message}>
                {msg.type === "system" ? (
                    <Text type="secondary" className={styles.systemMessage}>
                      {msg.data.text}
                    </Text>
                ) : (
                    <>
                      <Text strong>{(msg.data as MessageType).username}:</Text>
                      <Text> {(msg.data as MessageType).text}</Text>
                    </>
                )}
              </div>
          ))}
        </div>

        <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className={styles.form}
        >
          <Flex gap={10} className={styles.inputWrapper}>
            <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={username ? "Сообщение..." : "Введите /name ВашеИмя"}
                disabled={!socket?.connected}
                className={styles.input}
            />
            <Button
                className={styles.sendButton}
                type="primary"
                onClick={sendMessage}
                disabled={!socket?.connected || !inputText.trim()}
            >
              Send
            </Button>
          </Flex>

          <Paragraph>
            Статус:{" "}
            {socket?.connected ? (
                <Tag color="success">Подключено</Tag>
            ) : (
                <Tag color="error">Не подключено</Tag>
            )}
          </Paragraph>
        </form>
      </div>
  );
}
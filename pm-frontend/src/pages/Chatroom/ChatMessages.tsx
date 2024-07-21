import { useState, useContext, useEffect } from "react";

import { AuthContextValues } from "../../contexts/AuthContext";

import { CHAT_SEND_MESSAGE_SIGNAL, CHAT_GET_MESSAGE_SIGNAL, chatMessage, getChatMessages, userMessage, CHAT_NEW_MESSAGE_SIGNAL, newChatMessage } from "../../../../shared/networkInterface";
import { socket } from "../../utils/socket";

import "./ChatMessages.css";
import { DEFAULT_ROOM_NAME } from "./chatConstants";

const DEFAULT_MESSAGES_TO_GET = 30;

type ChatMessagesProps = {
  currentRoomName: string
};

function ChatMessageDisplay({ currentRoomName }: ChatMessagesProps) {

  const { username } = useContext(AuthContextValues);

  const [messages, setMessages] = useState<userMessage[]>([]);
  const [userText, setUserText] = useState("");

  useEffect(() => {
    socket.on(CHAT_NEW_MESSAGE_SIGNAL, (newMessage: newChatMessage) => {
      const userMessage : userMessage = {
        user: newMessage.username,
        body: newMessage.body
      };

      console.log("new message: " + JSON.stringify(newMessage));

      // TODO: problem, when setting messages everything becomes 
      // the same message (e.g. other person sends "i". other user
      // gets 4 "i"s)

      console.log("received a sent message signal. body: " + newMessage.body);
      setMessages((prevMessages) => { 
        const nextMessages = prevMessages.slice();
        nextMessages.push(userMessage);
        console.log("prev messages: " + JSON.stringify(prevMessages));
        console.log("next messages: " + JSON.stringify(nextMessages));
        return nextMessages;
      });
    });

    socket.on(CHAT_GET_MESSAGE_SIGNAL, (newMessages: getChatMessages) => {
      setMessages((prevMessages) => {
        console.log("prev messages: " + JSON.stringify(prevMessages));
        return [...prevMessages, ...newMessages.messages];
      });
    });

    return () => {
      // cleanup socket listeners
      socket.off(CHAT_GET_MESSAGE_SIGNAL);
      socket.off(CHAT_SEND_MESSAGE_SIGNAL);
    };
  }, []);

  useEffect(() => {
    if (currentRoomName !== DEFAULT_ROOM_NAME) {
      socket.emit(CHAT_GET_MESSAGE_SIGNAL, currentRoomName, DEFAULT_MESSAGES_TO_GET);
    }
  }, [currentRoomName]);

  function handleKeySubmit(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {

      const messageInfo: chatMessage = {
        username: username,
        roomName: currentRoomName,
        body: userText
      };

      socket.emit(CHAT_SEND_MESSAGE_SIGNAL, messageInfo);

      setUserText("");

      const newMessage : userMessage = {
        user: username,
        body: userText
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  }

  return (
    <>
      <div className="chatroom-messages">
        {
          messages.map((message, index) => {
            return (
              <div className="user-message" key={message.body + message.user + index}>
                <span className="message-username">{"User: " + message.user}</span>
                <span className="message-body">{message.body}</span>
              </div>
            );
          })
        }
      </div>
      <input value={userText}
        onChange={(event) => setUserText(event.target.value)}
        onKeyDown={(event) => handleKeySubmit(event)}
        placeholder="Message" >
      </input>
    </>
  );
}


export { ChatMessageDisplay };
import { useState, useContext, useEffect, useRef } from "react";

import { AuthContextValues } from "../../contexts/AuthContext";

import { CHAT_SEND_MESSAGE_SIGNAL, CHAT_GET_MESSAGE_SIGNAL, chatMessage, getChatMessages, userMessage, CHAT_NEW_MESSAGE_SIGNAL } from "../../../../shared/networkInterface";
import { socket } from "../../utils/socket";

import "./ChatMessages.css";
import { DEFAULT_ROOM_NAME } from "./chatConstants";

import defaultProfilePicture from "../../assets/anon.png";

const DEFAULT_MESSAGES_TO_GET = 30;

type ChatMessagesProps = {
  currentRoomName: string
};

function ChatMessageDisplay({ currentRoomName }: ChatMessagesProps) {

  const { username } = useContext(AuthContextValues);

  const [messages, setMessages] = useState<userMessage[]>([]);
  const [userText, setUserText] = useState("");

  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socket.on(CHAT_NEW_MESSAGE_SIGNAL, (newMessage: userMessage) => {
      console.log("new message: " + JSON.stringify(newMessage));

      // TODO: problem, when setting messages everything becomes 
      // the same message (e.g. other person sends "i". other user
      // gets 4 "i"s)

      console.log("received a sent message signal. body: " + newMessage.body);
      setMessages((prevMessages) => { 
        const nextMessages = prevMessages.slice();
        nextMessages.push(newMessage);
        console.log("prev messages: " + JSON.stringify(prevMessages));
        console.log("next messages: " + JSON.stringify(nextMessages));
        return nextMessages;
      });
    });

    socket.on(CHAT_GET_MESSAGE_SIGNAL, (newMessages: getChatMessages) => {
      console.log("chat get message received. new messages");
      console.log(JSON.stringify(newMessages));
      setMessages((prevMessages) => {
        console.log("prev messages: " + JSON.stringify(prevMessages));
        return [...prevMessages, ...newMessages.messages];
      });
    });

    return () => {
      // cleanup socket listeners
      socket.off(CHAT_GET_MESSAGE_SIGNAL);
      socket.off(CHAT_NEW_MESSAGE_SIGNAL);
    };
  }, []);

  useEffect(() => {
    if (currentRoomName !== DEFAULT_ROOM_NAME) {
      socket.emit(CHAT_GET_MESSAGE_SIGNAL, currentRoomName, DEFAULT_MESSAGES_TO_GET);
      console.log("emitted chat get message signal");
      // changing rooms, clear out previous messages
      setMessages([]);
    }
  }, [currentRoomName]);


  function handleKeySubmit(event: React.KeyboardEvent<HTMLInputElement>) {
    // event.currentTarget.clientHeight

    chatMessagesRef.current?.scrollTo({
      top: chatMessagesRef.current?.clientHeight,
      behavior: "smooth"
    });

    if (event.key === "Enter") {
      const messageInfo: chatMessage = {
        username: username,
        roomName: currentRoomName,
        body: userText
      };

      socket.emit(CHAT_SEND_MESSAGE_SIGNAL, messageInfo);

      setUserText("");

      const newMessage : userMessage = {
        username: username,
        body: userText
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  }

  //TODO: plan is 1. ability to publish chat rooms into the wild, 
  // able to be indexed by search engines (forum x discord hybrid)
  // 2. user profile pages, something that discord doesn't have. 

  return (
    <>
      <div className="chatroom-messages" ref={chatMessagesRef}>
        {
          messages.map((message, index) => {
            return (
              <div className="user-message" key={message.body + message.username + index}>
                <span className="user-profile-description">
                  <img src={defaultProfilePicture} className="user-profile-picture" />
                  <span className="message-username">{"User: " + message.username}</span>
                </span>
                <span className="message-body">{message.body}</span>
              </div>
            );
          })
        }
      </div>
      <input value={userText}
        onChange={(event) => setUserText(event.target.value)}
        onKeyDown={(event) => handleKeySubmit(event)}
        placeholder="Message" id="chatmessage-input">
      </input>
    </>
  );
}


export { ChatMessageDisplay };
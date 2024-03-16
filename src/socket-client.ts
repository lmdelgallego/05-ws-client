import { Manager, Socket } from "socket.io-client";

let socket: Socket;

export const connectToServer = (token: string) => {
  //http://localhost:3000/socket.io/socket.io.js
  const manager = new Manager(`${import.meta.env.VITE_URL_WS_API}/socket.io/socket.io.js`, {
    extraHeaders: {
      Authorization: `${token}`,
    },
  });

  socket?.removeAllListeners();
  socket = manager.socket("/");

  addListeners();
};

const addListeners = () => {
  const serverStatusLabel = document.querySelector("#server-status")!;
  const clientsUL = document.querySelector("#client-list")!;
  const messageForm = document.querySelector<HTMLFormElement>("#message-form")!;
  const messageInput =
    document.querySelector<HTMLInputElement>("#message-input")!;
  const messagesUL = document.querySelector("#messages-ul")!;

  socket.on("connect", () => {
    serverStatusLabel.innerHTML = "connected";
  });
  socket.on("disconnect", () => {
    serverStatusLabel.innerHTML = "offline";
  });

  socket.on("clients-updated", (clients: string[]) => {
    let clientsHTML = "";
    clients.forEach((clientId) => {
      clientsHTML += `
        <li>${clientId}</li>
      `;
    });
    clientsUL.innerHTML = clientsHTML;
  });

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (messageInput.value.trim().length <= 0) return;
    socket.emit("message-from-client", {
      id: "YO",
      message: messageInput.value,
    });
    messageInput.value = "";
  });

  socket.on(
    "message-from-server",
    (payload: { id: string; fullName: string; message: string }) => {
      const newMessage = `
          <strong>${payload.fullName}</strong>:
          <span>${payload.message}</span>
      `;
      const li = document.createElement("li");
      li.innerHTML = newMessage;
      messagesUL.appendChild(li);
    },
  );
};

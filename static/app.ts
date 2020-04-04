import "bootstrap";
import $ from "jquery";
import moment from "moment";
import io from "socket.io-client";

function scrollToBottom(): void {
  const messageListContainer: Element = document.getElementsByClassName(
    "messagelist-container",
  )[0];
  const { scrollHeight, clientHeight } = messageListContainer;
  messageListContainer.scrollTop = scrollHeight - clientHeight;
}

function toggleNav(): void {
  $("#channellistSidebar").css("width", "200px");
  $("body").css("margin-left", "200px");
}

function addUsersToUserlist(data: UserList): void {
  $(".userlist").find("*").not(".userlist-count").remove();
  data.sort((x, y) => (x.username < y.username ? 1 : -1));
  data.forEach((user: SocketUser) => {
    $(".userlist").append(
      `<li class="nav-item user" style="color:${user.color}"><b>${user.username}</b></li>`,
    );
  });
  $(".userlist-count").text(
    `${data.length} ${data.length === 1 ? "User" : "Users"}`,
  );
}

interface SocketUser {
  color: string;
  username: string;
  gravatar: string;
}

interface SocketUserMessage {
  room: string;
  message: string;
  user: SocketUser;
  created_at?: string;
}

interface SocketUserWithRoom {
  user: SocketUser;
  room: string;
}

interface SocketUserWithRoomAndUserList {
  user: SocketUser;
  userlist: UserList;
  room: string;
}

interface RoomMessages {
  [key: string]: NewMessage[];
}

interface RoomUsers {
  [key: string]: UserList;
}

interface NewMessage {
  user: SocketUser;
  created_at: string;
  message: string;
}

let user: SocketUser;

type UserList = SocketUser[];

$(() => {
  const socket = io();
  const roomUsers: RoomUsers = {} as RoomUsers;
  const roomMessages: RoomMessages = {} as RoomMessages;
  let currentRoom: string;
  $.post("/authenticated", (data) => {
    if (data.auth) {
      socket.emit("user authorized", { username: data.username });
    }
  });

  $(".channellistSidebarButton").on("click", () => {
    toggleNav();
  });

  $(document).on("click", ".channel", (e: Event): void => {
    $(".channellist").children().removeClass("active");
    $(e.target as EventTarget).addClass("active");
    const room: string = $(e.target as EventTarget).attr("room")!;

    $(".messagelist").empty();
    currentRoom = room;
    if (roomMessages[currentRoom]) {
      roomMessages[currentRoom].forEach((data: NewMessage) => {
        /* eslint-disable indent */

        $(".messagelist").append(
          `
        <li class="list-group-item message w-100">
          <ul class="row list-group list-group-flush list-group-horizontal col-12 mb-1 message">
            <li class="col-12 list-group-item avatar-box">
              <img class="message-avatar" src="${data.user.gravatar}"></img>
              <b>
                <span style="color:${data.user.color}">${
            data.user.username
          }</span>
                <span>- ${moment(data.created_at).format("H:mm:ss")}</b>${
            data.message
          }</span>
              </b>
            </li>
          </ul>
        </li>
            `,
        );
      });
      /* eslint-enable indent */
      scrollToBottom();
    }

    if (roomUsers[room]) {
      addUsersToUserlist(roomUsers[room]);
    }
  });

  $(".new-message").on("keyup", (e) => {
    if (e.keyCode === 13) {
      const inputData = $(".new-message").val() as string;

      const messageData: SocketUserMessage = {
        room: currentRoom,
        message: inputData,
        user,
      };
      socket.emit("new message", messageData);

      $(".new-message").val("");
    }
  });

  socket.on("new message", (data: SocketUserMessage) => {
    const newMessageData: NewMessage = {
      message: data.message,
      user: data.user,
      created_at: data.created_at!,
    };
    roomMessages[data.room].push(newMessageData);
    if (data.room === currentRoom) {
      $(".messagelist").append(
        `
<li class="list-group-item message w-100">
<ul class="row list-group list-group-flush list-group-horizontal col-12 mb-1 message">
<li class="col-12 list-group-item avatar-box">
<img class="message-avatar" src="${data.user.gravatar}"></img>

<b><span style="color:${data.user.color}">${data.user.username}</span>
    - ${moment(data.created_at).format("H:mm:ss")}</b>

${data.message}
</li>
</ul>
</li>
            `,
      );
      scrollToBottom();
    }
  });

  /**
   * Set the current User's username and color
   */
  socket.on("user authorized", (data: SocketUser) => {
    user = data;
    $(".username").html(`${data.username}`);
    $(".username").css("color", data.color);
    $(".avatar").attr("src", data.gravatar);
  });

  socket.on("you joined a room", (data: SocketUserWithRoomAndUserList) => {
    $(".list-group-item.active").removeClass("active");

    $(".channellist").append(
      `<li class="list-group-item active channel" room="${data.room}">#${data.room}</li>`,
    );

    currentRoom = data.room;

    roomMessages[data.room] = [] as NewMessage[];

    roomUsers[data.room] = data.userlist;

    $(".messagelist").empty();

    addUsersToUserlist(data.userlist);
  });

  socket.on("you left a room", (data: { room: string }) => {
    $(`.list-group-item[room="${data.room}"]`).remove();
  });

  // a new user has joined a room you are currently in
  socket.on("a different user joined a room", (data: SocketUserWithRoom) => {
    if (roomUsers[data.room] === undefined) {
      roomUsers[data.room] = [];
    }
    if (!roomUsers[data.room].some((x) => x.username === data.user.username)) {
      roomUsers[data.room].push(data.user);
      if (currentRoom === data.room) {
        addUsersToUserlist(roomUsers[data.room]);
      }
    }
  });

  socket.on("a different user is disconnecting", (data: SocketUserWithRoom) => {
    roomUsers[data.room] = roomUsers[data.room].filter(
      (user: SocketUser) => user.username !== data.user.username,
    );
    addUsersToUserlist(roomUsers[data.room]);
  });
});

import "bootstrap";
import $ from "jquery";
import moment from "moment";
import io from "socket.io-client";
$(() => {
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

  $(".channellistSidebarButton").on("click", () => {
    toggleNav();
  });

  const socket = io();
  const roomMessages: {} = {};
  const roomUsers: {} = {};
  let currentRoom: string = null;
  interface User {
    color: string;
    username: string;
  }

  function addUsersToUserlist(data: any): void {
    $(".userlist").find("*").not(".userlist-count").remove();
    data.sort((x, y) => x.username < y.username);
    data.forEach((user: User) => {
      $(".userlist").append(
        `<li class="nav-item user" style="color:${user.color}"><b>${user.username}</b></li>`,
      );
    });
    $(".userlist-count").text(
      `${data.length} ${data.length === 1 ? "User" : "Users"}`,
    );
  }

  $(document).on("click", ".channel", (e: any): void => {
    $(".channellist").children().removeClass("active");
    $(e.target).addClass("active");
    const room = $(e.target).attr("room");

    $(".messagelist").empty();
    currentRoom = room;
    if (roomMessages[room]) {
      roomMessages[room].forEach((data) => {
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
      const inputData = $(".new-message").val();

      socket.emit("new message", { room: currentRoom, message: inputData });
      $(".new-message").val("");
    }
  });

  socket.on("new message", (data) => {
    roomMessages[data.room].push({ message: data.message, user: data.user });
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

  $.post("/authenticated", (data) => {
    if (data.auth) {
      socket.emit("user authorized", { username: data.username });
    }
  });
  /**
   * Set the current User's username and color
   */
  socket.on("user authorized", (data) => {
    $(".username").html(`${data.username}`);
    $(".username").css("color", data.color);
    $(".avatar").attr("src", data.gravatar);
  });

  socket.on("you joined a room", (data) => {
    $(".list-group-item.active").removeClass("active");
    $(".channellist").append(
      `<li class="list-group-item active channel" room="${data.room}">#${data.room}</li>`,
    );
    currentRoom = data.room;
    roomMessages[data.room] = [];
    roomUsers[data.room] = data.userlist;
    $(".messagelist").empty();
    return addUsersToUserlist(data.userlist);
  });

  socket.on("you left a room", (data) => {
    $(`.list-group-item[room="${data.room}"]`).remove();
  });

  // a new user has joined a room you are currently in

  socket.on("a different user joined a room", (data) => {
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

  socket.on("a different user is disconnecting", (data) => {
    roomUsers[data.room] = roomUsers[data.room].filter(
      (x) => x.username !== data.user.username,
    );
    addUsersToUserlist(roomUsers[data.room]);
  });
});

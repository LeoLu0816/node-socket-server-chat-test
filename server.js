var io = require('socket.io')(9987)
// io.set('log level', 1) // 關閉 debug 訊息

io.on('connection', onConnect)

const roomSetting = [
  { roomid: 'R0000', roomName: '房間一', userCount: 6527 },
  { roomid: 'R0001', roomName: '房間二', userCount: 9840 }
]

let userDB = {}

let roomMsgHistory = {}
Object.keys(roomSetting).map(x => { roomMsgHistory[roomSetting[x].roomid] = [] })

let userMsgHistory = {}

function onConnect (socket) {
  const userData = { userid: '', userName: '' }
  const msgModel = { roomid: '', userid: '', msg: '', img: '' }

  // 告訴連線者, 你連線成功了
  socket.on('user_connect', function (data) {
    Object.assign(userData, data)
    if (!Object.prototype.hasOwnProperty.call(userMsgHistory, userData.userid)) {
      userMsgHistory[userData.userid] = {}
    }
    const db = { socket, name: userData.userName }
    userDB[userData.userid] = db
    let msgHistoryAll = []
    Object.keys(roomMsgHistory).forEach(x => {
      msgHistoryAll = msgHistoryAll.concat(roomMsgHistory[x])
    })
    socket.emit('connect_success', userData, msgHistoryAll)
    io.emit('userJoin', userData)
  })

  // 加入好友
  socket.on('addFriend', function (data) {
    const friendId = data.friendId
    if (Object.prototype.hasOwnProperty.call(userMsgHistory, friendId)) {
      userMsgHistory[userData.userid][friendId] = []
    } else {
      socket.emit('addFriendError', 'This UserID in not found.')
    }
  })

  // 收到訊息
  socket.on('message', function (data) {
    const msgData = Object.assign({ date: new Date().getTime() }, msgModel, data, userData)
    if (msgData.roomid) {
      roomMsgHistory[msgData.roomid].push(msgData)
    } else if (msgData.to) {
      userMsgHistory[msgData.to][userData.userid].push(msgData)
    }
    io.emit('message', msgData)
  })
};

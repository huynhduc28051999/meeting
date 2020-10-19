const socket = io('/')
const videoGrid = document.querySelector('#video-grid')
var peer = new Peer(undefined, {
  host: '/',
  port: '4001'
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)
  peer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', (userVideoStream) => {
      addVideoStream(video, userVideoStream)
    })
  })
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})
peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})
const addVideoStream = (video, stream) => {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream)
  const video = document.createElement('video')
  addVideoStream(video, stream)
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  peer[userId] = call
}
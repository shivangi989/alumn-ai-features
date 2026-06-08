// client/src/api.js
import axios from 'axios'

// auto group one user
export const autoGroupUser = async (userId) => {
  const res = await axios.post('/api/auto-group', { userId })
  return res.data
}

// auto group all users
export const autoGroupAll = async () => {
  const res = await axios.post('/api/auto-group-all')
  return res.data
}

// send chat message
export const sendChatMessage = async (message, history) => {
  const res = await axios.post('/api/chat', { message, history })
  return res.data
}
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://match-my-resume-ofrw.onrender.com'
})

export const analyzeResume = (formData) => api.post('/analyze', formData)
export const rewriteResume = (formData) => api.post('/rewrite', formData)
export const getMockInterview = (formData) => api.post('/mockinterview', formData)
export const evaluateInterview = (payload) => api.post('/evaluateinterview', payload)
export const generateCoverLetter = (formData) => api.post('/coverletter', formData)

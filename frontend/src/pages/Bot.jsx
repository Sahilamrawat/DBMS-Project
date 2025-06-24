import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUserCircle, FaSpinner } from 'react-icons/fa';
import { ACCESS_TOKEN } from '../constants';
import { io } from 'socket.io-client';
import api from '../api';
import Navheader from '../Components/Navheader';

const SOCKET_URL = 'http://localhost:8001'; // Change if your backend is on a different host/port

const Bot = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hi! I am your MediTrack AI assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Fetch chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        const res = await api.get('/api/chatbot/history/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.history && res.data.history.length > 0) {
          // Convert MongoDB history to your message format
          const historyMessages = res.data.history.reverse().map(chat => [
            { sender: 'user', text: chat.message },
            { sender: 'ai', text: chat.ai_response }
          ]).flat();
          setMessages(historyMessages);
        } else {
          setMessages([
            {
              sender: 'ai',
              text: 'Hi! I am your MediTrack AI assistant. How can I help you today?'
            }
          ]);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Connect to Socket.IO server
  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    console.log("Token sent to socket:", token);
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
    });

    socket.connect();

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('chat_response', (data) => {
      setIsTyping(false);
      if (data.error) {
        setError(data.error);
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: 'Sorry, something went wrong. Please try again.' }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: data.response }
        ]);
      }
      setLoading(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setError('');
    setLoading(true);
    setIsTyping(true);
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const token = localStorage.getItem(ACCESS_TOKEN);
    socketRef.current.emit('chat_message', {
      token,
      message: input,
    });
    setInput('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setIsTyping(true);
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: `Uploaded report: ${file.name}` }
    ]);
    const token = localStorage.getItem(ACCESS_TOKEN);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/chatbot/upload-report/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: res.data.summary }
      ]);
    } catch (err) {
      setError('Failed to process PDF. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 flex flex-col items-center justify-start p-4">
      <Navheader />
      {/* Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Chat Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden relative z-10 flex flex-col h-[70vh] mt-24"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#77B254] to-green-600 p-6 flex items-center gap-3">
          <FaRobot className="text-white text-3xl" />
          <h2 className="text-2xl font-bold text-white">MediTrack AI Chatbot</h2>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-green-50/30">
          {historyLoading ? (
            <div className="flex justify-center items-center h-full">
              <FaSpinner className="animate-spin text-3xl text-[#77B254]" />
              <span className="ml-3 text-[#77B254] font-medium">Loading chat history...</span>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-md flex items-end gap-2
                    ${msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#77B254] to-green-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-green-100'}
                  `}>
                    {msg.sender === 'ai' && <FaRobot className="text-[#77B254] text-xl mr-2" />}
                    <span className="whitespace-pre-line">{msg.text}</span>
                    {msg.sender === 'user' && <FaUserCircle className="text-white text-xl ml-2" />}
                  </div>
                </motion.div>
              ))}
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[70%] px-4 py-3 rounded-2xl shadow-md flex items-center gap-2 bg-white text-gray-800 rounded-bl-none border border-green-100">
                    <FaRobot className="text-[#77B254] text-xl mr-2 animate-bounce" />
                    <span className="italic opacity-70 animate-pulse">Typing...</span>
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="bg-white p-4 flex items-center gap-3 border-t">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent text-gray-800 bg-green-50"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-[#77B254] to-green-600 text-white p-3 rounded-xl shadow-md hover:from-green-600 hover:to-[#77B254] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            <FaPaperPlane className="text-xl" />
          </button>
          <button
            type="button"
            onClick={handleUploadClick}
            className="bg-gradient-to-r from-[#77B254] to-green-600 text-white p-3 rounded-xl shadow-md hover:from-green-600 hover:to-[#77B254] transition-all duration-300"
            aria-label="Upload PDF"
            title="Upload PDF"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </form>
        {error && (
          <div className="absolute bottom-20 left-0 right-0 mx-auto w-fit bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow">
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Bot;

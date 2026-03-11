import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChatSidebar, MessageBubble, TypingIndicator } from '../components/chat/index';
import { useMessages } from '../hooks';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { joinConversation, leaveConversation, onMessage, emitTyping, onTyping } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [inputMsg, setInputMsg] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const { messages, addMessage, sendMessage, isLoading: msgsLoading } = useMessages(conversationId);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/messages/conversations');
        setConversations(data.data.conversations);
      } catch {}
      finally { setLoadingConvs(false); }
    };
    load();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    joinConversation(conversationId);
    const unsub = onMessage((msg) => addMessage(msg));
    const unsubTyping = onTyping(({ userId: uid, isTyping: t }) => {
      if (uid !== user?._id) setTypingUser(t ? uid : null);
    });
    return () => { leaveConversation(conversationId); unsub?.(); unsubTyping?.(); };
  }, [conversationId]);

  const handleSend = async () => {
    if (!inputMsg.trim()) return;
    const msg = inputMsg;
    setInputMsg('');
    emitTyping(conversationId, false);
    const result = await sendMessage(msg);
    if (!result.success) toast.error('Failed to send message');
  };

  const activeConv = conversations.find((c) => c._id === conversationId);
  const other = activeConv?.otherParticipant;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 120px)', minHeight: 500 }}>
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px 0 0 16px', overflow: 'hidden' }}>
        <ChatSidebar conversations={conversations} isLoading={loadingConvs} />
      </div>
      <div style={{ background: '#0F172A', border: '1px solid #334155', borderLeft: 'none', borderRadius: '0 16px 16px 0', display: 'flex', flexDirection: 'column' }}>
        {conversationId && other ? (
          <>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                {other.firstName?.charAt(0)}{other.lastName?.charAt(0)}
              </div>
              <div style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 14 }}>{other.firstName} {other.lastName}</div>
            </div>
            <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {msgsLoading
                ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
                : messages.map((msg) => <MessageBubble key={msg._id} message={msg} isOwn={msg.sender?._id === user?._id || msg.sender === user?._id} />)
              }
              {typingUser && <TypingIndicator name={other.firstName} />}
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #334155', display: 'flex', gap: 10 }}>
              <input value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} placeholder="Type a message..." style={{ flex: 1, background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '10px 14px', color: '#F1F5F9', fontSize: 14, outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
              <button onClick={handleSend} style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', border: 'none', borderRadius: 12, padding: '10px 16px', color: '#fff', cursor: 'pointer', fontSize: 18 }}>➤</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>💬</div>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { Send, Mic } from 'lucide-react';

interface Message {
  id: number;
  content: string | null;
  audio_url: string | null;
  created_at: string;
  user_id: string;
  profiles: Profile | null;
}

const ChatSection = () => {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Загружаем сообщения один раз при монтировании
    fetchMessages();

    // Подписываемся на канал один раз
    const channel = supabase.channel('chat-channel');

    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages' },
      (payload) => {
        // Fetch the new message with profile data
        fetchSingleMessage(payload.new.id);
      }
    ).subscribe();

    // Отписываемся при размонтировании компонента
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Пустой массив зависимостей, чтобы useEffect выполнился только один раз

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, profiles(*)')
      .order('created_at', { ascending: true });
    if (error) console.error('Error fetching messages:', error);
    else setMessages(data as Message[]);
  };

  const fetchSingleMessage = async (id: number) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, profiles(*)')
      .eq('id', id)
      .single();
    if (error) console.error('Error fetching single message:', error);
    else {
      setMessages((prev) => [...prev, data as Message]);
      // Показываем уведомление, если вкладка не активна
      if (document.hidden) {
        new Notification('Новое сообщение!', {
          body: data.profiles?.username + ': ' + (data.content || 'Голосовое сообщение'),
          icon: data.profiles?.avatar_url,
        });
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return alert("Пожалуйста, войдите в аккаунт, чтобы писать сообщения.");
    
    const { error } = await supabase
      .from('chat_messages')
      .insert({ content: newMessage, user_id: user.id });
      
    if (error) {
      console.error("Error sending message:", error);
      alert("Не удалось отправить: " + error.message);
    } else {
      setNewMessage('');
      fetchMessages(); // Refresh immediately
    }
  };

  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fileName = `${user?.id}_${Date.now()}.webm`;
        const { data, error } = await supabase.storage
          .from('voice_messages')
          .upload(fileName, audioBlob);
        if (error) {
          console.error('Error uploading audio:', error);
          return;
        }
        const { data: publicUrlData } = supabase.storage
          .from('voice_messages')
          .getPublicUrl(data.path);
        
        await supabase.from('chat_messages').insert({
          user_id: user!.id,
          audio_url: publicUrlData.publicUrl,
        });
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  return (
    <section className="relative z-10 py-20 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl sm:text-4xl text-center mb-12 glow-text"
      >
        💌 Наш чат
      </motion.h2>
      <div className="max-w-2xl mx-auto glass-effect rounded-2xl p-4 flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto space-y-4 p-4 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-3 ${
                msg.user_id === profile?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.user_id !== profile?.id && (
                <img src={msg.profiles?.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />
              )}
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                  msg.user_id === profile?.id
                    ? 'bg-primary/80 text-white rounded-br-none'
                    : 'bg-white/10 text-white rounded-bl-none'
                }`}
              >
                {msg.content && <p className="text-sm">{msg.content}</p>}
                {msg.audio_url && <audio src={msg.audio_url} controls className="w-full h-10" />}
                <p className="text-xs opacity-60 mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>
        <div className="flex gap-2 p-2 border-t border-white/10">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Напиши что-нибудь..."
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={handleRecord}
            className={`p-3 rounded-xl transition-colors ${
              isRecording ? 'bg-red-500/50 text-red-200' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <Mic size={20} />
          </button>
          <button
            onClick={handleSendMessage}
            className="bg-primary/80 hover:bg-primary p-3 rounded-xl transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatSection;

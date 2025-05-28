'use client';

import React, { useState, useEffect } from 'react';
import { Nav } from '@/Home/Navbar/Nav';
import { useSession } from 'next-auth/react';
import { FaLock, FaGlobe, FaPlus, FaUsers, FaTimes, FaUser } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

// Enhanced Avatar component with colored fallback
const Avatar = ({ src, name, size = 8 }) => {
  const [imgError, setImgError] = useState(false);
  
  // Generate consistent color from initials
  const getColorFromInitials = (initials) => {
    if (!initials) return 'from-purple-600 to-purple-700';
    
    const gradients = [
      'from-red-500 to-red-600',
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-purple-500 to-purple-600',
      'from-teal-500 to-teal-600',
      'from-orange-500 to-orange-600',
      'from-cyan-500 to-cyan-600'
    ];
    
    const charCodeSum = initials.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return gradients[charCodeSum % gradients.length];
  };

  if (imgError || !src) {
    const initials = name 
      ? name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
      : '';
    const bgGradient = getColorFromInitials(initials);
    
    return (
      <div 
        className={`w-${size} h-${size} rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center text-white`}
        style={{ fontSize: `${Math.max(size * 0.2, 0.75)}rem` }}
      >
        {initials || <FaUser />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`w-${size} h-${size} rounded-full object-cover`}
      onError={() => setImgError(true)}
    />
  );
};

export default function CommunitiesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    type: 'public',
  });
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: 'Hello, welcome to the community!', 
      sender: 'Community Bot',
      timestamp: new Date(Date.now() - 3600000),
    },
    { 
      id: 2, 
      text: 'Thank you! Happy to be here.', 
      sender: session?.user?.name || 'You',
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: 3,
      text: 'Has anyone worked with the new React features?',
      sender: 'JaneDoe',
      timestamp: new Date(Date.now() - 900000),
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Simulate loading communities
    setCommunities([
      {
        id: uuidv4(),
        name: 'Frontend Wizards',
        description: 'A community for frontend developers to share knowledge and collaborate.',
        type: 'public',
        creator: 'admin',
        members: 120,
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Backend Masters',
        description: 'For backend developers discussing server-side technologies.',
        type: 'public',
        creator: 'serverGuru',
        members: 85,
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Exclusive Designers',
        description: 'Private community for experienced UI/UX designers.',
        type: 'private',
        creator: 'designLead',
        members: 42,
        createdAt: new Date(),
      }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCommunity((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCommunity = (e) => {
    e.preventDefault();
    if (newCommunity.name.trim() === '' || newCommunity.description.trim() === '') {
      alert('Community Name and Description are required.');
      return;
    }
    const newComm = {
      ...newCommunity,
      id: uuidv4(),
      creator: session?.user?.name || 'anonymous',
      members: 1,
      createdAt: new Date(),
    };
    setCommunities((prev) => [...prev, newComm]);
    setSelectedCommunity(newComm);
    setNewCommunity({ name: '', description: '', type: 'public' });
    setIsModalOpen(false);
    
    // Add welcome message
    setMessages(prev => [
      ...prev,
      {
        id: uuidv4(),
        text: `Welcome to the new "${newComm.name}" community! Start the conversation.`,
        sender: 'System',
        timestamp: new Date(),
      }
    ]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '') {
      const newMsg = {
        id: uuidv4(),
        text: newMessage,
        sender: session?.user?.name || 'You',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 100);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 dark:bg-gray-900 flex flex-col'>
      <Nav />
      
      <div className='flex flex-1 pt-36 pb-16'>
        {/* Left sidebar - Communities list */}
        <div className='w-1/4 bg-gradient-to-br from-indigo-900 to-purple-800 p-5 text-white space-y-4 overflow-y-auto fixed h-[calc(100vh-4rem)]'>
          <button
            onClick={() => setIsModalOpen(true)}
            className='flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-3 rounded-lg transition duration-300 w-full justify-center font-medium'
          >
            <FaPlus /> Create Community
          </button>

          <div className='space-y-3 mt-4'>
            <h3 className='font-bold text-lg mb-2'>Your Communities</h3>
            {communities.map((community) => (
              <div
                key={community.id}
                className={`bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-lg cursor-pointer hover:bg-opacity-20 transition duration-300 ${
                  selectedCommunity?.id === community.id ? 'ring-2 ring-indigo-500 bg-opacity-30' : ''
                }`}
                onClick={() => setSelectedCommunity(community)}
              >
                <div className='flex items-start gap-3'>
                  <Avatar name={community.name} size={10} />
                  <div className='flex-1'>
                    <div className='flex justify-between items-start'>
                      <h3 className='font-bold'>{community.name}</h3>
                      <span className='flex items-center gap-1 text-xs'>
                        <FaUsers /> {community.members}
                      </span>
                    </div>
                    <p className='text-sm text-gray-300 line-clamp-1'>{community.description}</p>
                    <div className='flex items-center gap-1 mt-1 text-xs'>
                      {community.type === 'private' ? (
                        <FaLock className='text-red-400' />
                      ) : (
                        <FaGlobe className='text-green-400' />
                      )}
                      <span className='text-gray-400'>
                        Created {community.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className='flex w-3/4 ml-[25%]'>
          {/* Chat area */}
          <div className='w-2/3 p-5 bg-white dark:bg-gray-800 text-black dark:text-white overflow-y-auto'>
            {selectedCommunity ? (
              <div className='h-full flex flex-col'>
                <div className='border-b dark:border-gray-700 pb-4 mb-4'>
                  <div className='flex items-center gap-3'>
                    <Avatar name={selectedCommunity.name} size={12} />
                    <div>
                      <h2 className='text-2xl font-bold'>{selectedCommunity.name}</h2>
                      <p className='text-gray-600 dark:text-gray-400'>{selectedCommunity.description}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 mt-2 text-sm'>
                    {selectedCommunity.type === 'private' ? (
                      <span className='flex items-center gap-1 text-red-500'>
                        <FaLock /> Private Community
                      </span>
                    ) : (
                      <span className='flex items-center gap-1 text-green-500'>
                        <FaGlobe /> Public Community
                      </span>
                    )}
                    <span className='text-gray-500 dark:text-gray-400'>
                      • {selectedCommunity.members} members
                      • Created {selectedCommunity.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div id='chat-messages' className='flex-1 overflow-y-auto space-y-4 mb-4'>
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 ${msg.sender === (session?.user?.name || 'You') ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender !== (session?.user?.name || 'You') && (
                        <Avatar 
                          name={msg.sender} 
                          size={8}
                        />
                      )}
                      <div 
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender === (session?.user?.name || 'You') 
                            ? 'bg-purple-600 text-white rounded-br-none' 
                            : msg.sender === 'System'
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                              : 'bg-blue-500 text-white rounded-bl-none'
                        }`}
                      >
                        {msg.sender !== (session?.user?.name || 'You') && msg.sender !== 'System' && (
                          <div className='font-bold text-xs mb-1'>{msg.sender}</div>
                        )}
                        <div>{msg.text}</div>
                        <div className={`text-xs mt-1 ${
                          msg.sender === (session?.user?.name || 'You') 
                            ? 'text-purple-200' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className='mt-auto'>
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      placeholder='Type a message...'
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className='flex-1 p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                    <button 
                      type='submit' 
                      className='bg-purple-700 hover:bg-purple-800 p-3 text-white rounded-lg transition duration-300'
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400'>
                <div className='text-center p-8 max-w-md'>
                  <FaUsers className='text-5xl mx-auto mb-4 text-purple-500' />
                  <h3 className='text-xl font-bold mb-2'>No Community Selected</h3>
                  <p className='mb-4'>Select a community from the sidebar to view its chat or create a new one.</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className='flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg transition duration-300 mx-auto'
                  >
                    <FaPlus /> Create Community
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Community details sidebar */}
          {selectedCommunity && (
            <div className='w-1/3 p-5 bg-gray-50 dark:bg-gray-900 border-l dark:border-gray-800 overflow-y-auto'>
              <div className='space-y-6'>
                <div className='text-center'>
                  <Avatar name={selectedCommunity.name} size={24} />
                  <h3 className='text-xl font-bold mt-3'>{selectedCommunity.name}</h3>
                  <p className='text-gray-600 dark:text-gray-400'>{selectedCommunity.description}</p>
                </div>

                <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
                  <h4 className='font-bold mb-3'>Community Info</h4>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>Type:</span>
                      <span className='font-medium'>
                        {selectedCommunity.type === 'private' ? (
                          <span className='text-red-500 flex items-center gap-1'>
                            <FaLock /> Private
                          </span>
                        ) : (
                          <span className='text-green-500 flex items-center gap-1'>
                            <FaGlobe /> Public
                          </span>
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>Members:</span>
                      <span className='font-medium flex items-center gap-1'>
                        <FaUsers /> {selectedCommunity.members}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>Created:</span>
                      <span className='font-medium'>
                        {selectedCommunity.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>Creator:</span>
                      <span className='font-medium'>{selectedCommunity.creator}</span>
                    </div>
                  </div>
                </div>

                <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
                  <h4 className='font-bold mb-3'>Community Rules</h4>
                  <ul className='list-disc pl-5 space-y-2 text-sm'>
                    <li>Be respectful to all members</li>
                    <li>No spam or self-promotion</li>
                    <li>Keep discussions on-topic</li>
                    <li>No offensive language</li>
                    {selectedCommunity.type === 'private' && (
                      <li className='text-red-500'>Do not share private community content</li>
                    )}
                  </ul>
                </div>

                <button className='w-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 py-2 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-800 transition duration-300'>
                  Leave Community
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Community Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md'>
            <div className='flex justify-between items-center border-b dark:border-gray-700 p-4'>
              <h3 className='text-lg font-bold'>Create New Community</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className='text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleCreateCommunity} className='p-4 space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Community Name</label>
                <input
                  type='text'
                  name='name'
                  value={newCommunity.name}
                  onChange={handleInputChange}
                  className='w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600'
                  placeholder='e.g. React Developers'
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium mb-1'>Description</label>
                <textarea
                  name='description'
                  value={newCommunity.description}
                  onChange={handleInputChange}
                  className='w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600'
                  placeholder='What is this community about?'
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium mb-2'>Community Type</label>
                <div className='flex gap-4'>
                  <label className='flex items-center gap-2'>
                    <input
                      type='radio'
                      name='type'
                      value='public'
                      checked={newCommunity.type === 'public'}
                      onChange={handleInputChange}
                      className='text-purple-600'
                    />
                    <div className='flex items-center gap-1'>
                      <FaGlobe className='text-green-500' /> Public
                    </div>
                  </label>
                  
                  <label className='flex items-center gap-2'>
                    <input
                      type='radio'
                      name='type'
                      value='private'
                      checked={newCommunity.type === 'private'}
                      onChange={handleInputChange}
                      className='text-purple-600'
                    />
                    <div className='flex items-center gap-1'>
                      <FaLock className='text-red-500' /> Private
                    </div>
                  </label>
                </div>
              </div>
              
              <div className='pt-4 flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
                >
                  Create Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
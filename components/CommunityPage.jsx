'use client';

import React, { useState, useEffect } from 'react';
import { Nav } from '@/Home/Navbar/Nav';
import { useSession } from 'next-auth/react';
import { FaLock, FaGlobe, FaPlus, FaUsers, FaTimes, FaUser, FaSearch } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

const Avatar = ({ src, name, size = 8 }) => {
  const [imgError, setImgError] = useState(false);
  
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
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [communityTypeFilter, setCommunityTypeFilter] = useState('all');
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    type: 'public',
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isJoining, setIsJoining] = useState(false);

const checkMembership = (community) => {
  return community?.members?.some(member => 
    typeof member === 'object' ? member._id === session?.user?.id : member === session?.user?.id
  );
};

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      try {
        let url = '/api/communities';
        const params = new URLSearchParams();
        
        if (searchTerm) params.append('search', searchTerm);
        if (communityTypeFilter !== 'all') params.append('type', communityTypeFilter);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (selectedCommunity) {
          const updatedSelected = data.find(c => c._id === selectedCommunity._id);
          if (updatedSelected) {
            setSelectedCommunity(updatedSelected);
          }
        }
        
        setCommunities(data);
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCommunities();
  }, [searchTerm, communityTypeFilter]);

  useEffect(() => {
    if (!selectedCommunity) return;
    
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/communities/${selectedCommunity._id}/messages`);
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };
    
    fetchMessages();
  }, [selectedCommunity]);

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (newCommunity.name.trim() === '' || newCommunity.description.trim() === '') {
      alert('Community Name and Description are required.');
      return;
    }
  
    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCommunity,
          members: [session.user.id]
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to create community');
      }
      
      const createdCommunity = await res.json();
      setCommunities(prev => [...prev, createdCommunity]);
      setSelectedCommunity({
        ...createdCommunity,
        members: [session.user.id]
      });
      setNewCommunity({ name: '', description: '', type: 'public' });
      setIsModalOpen(false);
      
      setMessages([
        {
          _id: uuidv4(),
          text: `Welcome to the new "${createdCommunity.name}" community! Start the conversation.`,
          sender: { name: 'System' },
          createdAt: new Date(),
          systemMessage: true
        }
      ]);
    } catch (error) {
      console.error('Error creating community:', error);
      alert('Failed to create community');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (!newMessage.trim()) {
      alert('Message cannot be empty');
      return;
    }
  
    if (!selectedCommunity) {
      console.error('No community selected');
      return;
    }
  
    try {
      // Debug log before sending
      console.log('Attempting to send message:', {
        communityId: selectedCommunity._id,
        text: newMessage,
        sender: session?.user?.id
      });
  
      const response = await fetch(`/api/communities/${selectedCommunity._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newMessage,
          senderId: session?.user?.id, // Explicit sender ID
          communityId: selectedCommunity._id // Explicit community ID
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send message:', errorData);
        alert(errorData.message || 'Failed to send message');
        return;
      }
  
      const sentMessage = await response.json();
      console.log('Message sent successfully:', sentMessage);
  
      // Update local state optimistically
      setMessages(prev => [...prev, {
        ...sentMessage,
        sender: { _id: session?.user?.id, name: session?.user?.name }
      }]);
      
      setNewMessage(''); // Clear input field
  
      // Scroll to bottom
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 100);
  
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  
  const handleJoinCommunity = async (communityId) => {
    setIsJoining(true);
    try {
      console.log('Joining community:', communityId, 'User ID:', session?.user?.id);
      
      const res = await fetch(`/api/communities/${communityId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session?.user?.id }), // Explicitly send user ID
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Join failed:', errorData);
        throw new Error(errorData.message || 'Failed to join community');
      }
  
      const updatedCommunity = await res.json(); // Assume backend returns updated community
      
      console.log('Updated community data:', updatedCommunity);
      
      // Update all relevant states
      setSelectedCommunity(updatedCommunity);
      setCommunities(prev => 
        prev.map(community => 
          community._id === communityId ? updatedCommunity : community
        )
      );
      
      // Refresh messages
      const messagesRes = await fetch(`/api/communities/${communityId}/messages`);
      const updatedMessages = await messagesRes.json();
      setMessages(updatedMessages);
      
      console.log('Post-join verification - is member now?', 
        updatedCommunity.members.includes(session?.user?.id));
      
    } catch (error) {
      console.error('Error joining community:', error);
      alert(error.message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    if (!confirm('Are you sure you want to leave this community?')) return;
    
    try {
      const res = await fetch(`/api/communities/${communityId}/members`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to leave community');
      }
      
      // Refresh communities list
      const updated = await fetch('/api/communities').then(res => res.json());
      setCommunities(updated);
      
      // If this was the selected community, clear it
      if (selectedCommunity?._id === communityId) {
        setSelectedCommunity(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error leaving community:', error);
      alert(error.message);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredCommunities = communities.filter(community => {
    const name = community.name || '';
    const description = community.description || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = name.toLowerCase().includes(searchTermLower) || 
                         description.toLowerCase().includes(searchTermLower);
    const matchesType = communityTypeFilter === 'all' || community.type === communityTypeFilter;
    return matchesSearch && matchesType;
  });

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

          <div className='mt-4 space-y-3'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Search communities...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
              <FaSearch className='absolute left-3 top-3 text-white/50' />
            </div>

            <div className='flex gap-2'>
              <button
                onClick={() => setCommunityTypeFilter('all')}
                className={`text-sm px-3 py-1 rounded-full ${
                  communityTypeFilter === 'all' 
                    ? 'bg-white text-purple-800' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCommunityTypeFilter('public')}
                className={`text-sm px-3 py-1 rounded-full flex items-center gap-1 ${
                  communityTypeFilter === 'public' 
                    ? 'bg-green-500/90 text-white' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <FaGlobe size={12} /> Public
              </button>
              <button
                onClick={() => setCommunityTypeFilter('private')}
                className={`text-sm px-3 py-1 rounded-full flex items-center gap-1 ${
                  communityTypeFilter === 'private' 
                    ? 'bg-red-500/90 text-white' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <FaLock size={12} /> Private
              </button>
            </div>
          </div>

          <div className='space-y-3 mt-4'>
            <h3 className='font-bold text-lg mb-2'>Your Communities</h3>
            {isLoading ? (
              <div className='flex justify-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
              </div>
            ) : filteredCommunities.length === 0 ? (
              <p className='text-center text-white/70 py-4'>No communities found</p>
            ) : (
              filteredCommunities.map((community) => (
                <div
                  key={community._id}
                  className={`bg-white bg-opacity-10 backdrop-blur-sm p-3 rounded-lg cursor-pointer hover:bg-opacity-20 transition duration-300 ${
                    selectedCommunity?._id === community._id ? 'ring-2 ring-indigo-500 bg-opacity-30' : ''
                  }`}
                  onClick={() => setSelectedCommunity(community)}
                >
                  <div className='flex items-start gap-3'>
                    <Avatar name={community.name} size={10} />
                    <div className='flex-1'>
                      <div className='flex justify-between items-start'>
                        <h3 className='font-bold'>{community.name}</h3>
                        <span className='flex items-center gap-1 text-xs'>
                          <FaUsers /> {community.members?.length || 0}
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
                          Created {new Date(community.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
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
                      • {selectedCommunity.members?.length || 0} members
                      • Created {new Date(selectedCommunity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='mt-3 flex gap-2'>
                  {checkMembership(selectedCommunity) ? (
                      <button
                        onClick={() => handleLeaveCommunity(selectedCommunity._id)}
                        className='px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-800 transition'
                      >
                        Leave Community
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinCommunity(selectedCommunity._id)}
                        disabled={isJoining}
                        className={`px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-800 transition ${
                          isJoining ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isJoining ? 'Joining...' : 'Join Community'}
                      </button>
                    )}
                  </div>
                </div>

                <div id='chat-messages' className='flex-1 overflow-y-auto space-y-4 mb-4'>
                   {Array.isArray(messages) && messages.map((msg) => (
                    <div 
                      key={msg._id} 
                      className={`flex gap-3 ${
                        msg.sender?._id === session?.user?.id || msg.sender === 'You' 
                          ? 'justify-end' 
                          : 'justify-start'
                      }`}
                    >
                      {(msg.sender?._id !== session?.user?.id && !msg.systemMessage) && (
                        <Avatar 
                          name={msg.sender?.name} 
                          size={8}
                        />
                      )}
                      <div 
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender?._id === session?.user?.id || msg.sender === 'You'
                            ? 'bg-purple-600 text-white rounded-br-none' 
                            : msg.systemMessage
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                              : 'bg-blue-500 text-white rounded-bl-none'
                        }`}
                      >
                        {msg.sender?._id !== session?.user?.id && !msg.systemMessage && (
                          <div className='font-bold text-xs mb-1'>{msg.sender?.name}</div>
                        )}
                        <div>{msg.text}</div>
                        <div className={`text-xs mt-1 ${
                          msg.sender?._id === session?.user?.id || msg.sender === 'You'
                            ? 'text-purple-200' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {checkMembership(selectedCommunity) ? (
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
) : (
  <div className='mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-center'>
    {console.log('Rendering join prompt - Current user:', session?.user?.id, 'Members:', selectedCommunity?.members)}
    Join this community to participate in the conversation
  </div>
)}
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
                        <FaUsers /> {selectedCommunity.members?.length || 0}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>Created:</span>
                      <span className='font-medium'>
                        {new Date(selectedCommunity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>Creator:</span>
                      <span className='font-medium'>{selectedCommunity.creator?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
                  <h4 className='font-bold mb-3'>Community Rules</h4>
                  <ul className='list-disc pl-5 space-y-2 text-sm'>
                    {selectedCommunity.rules?.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                    {(!selectedCommunity.rules || selectedCommunity.rules.length === 0) && (
                      <li className='text-gray-500'>No specific rules set for this community</li>
                    )}
                  </ul>
                </div>

                {selectedCommunity.members?.includes(session?.user?.id) && (
                  <button 
                    onClick={() => handleLeaveCommunity(selectedCommunity._id)}
                    className='w-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 py-2 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-800 transition duration-300'
                  >
                    Leave Community
                  </button>
                )}
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
                  onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
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
                  onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
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
                      onChange={() => setNewCommunity({...newCommunity, type: 'public'})}
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
                      onChange={() => setNewCommunity({...newCommunity, type: 'private'})}
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
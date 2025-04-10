import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const PeoplePage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .eq('is_deleted', false);
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      backgroundColor: '#cccccc',
      height: '100vh',
      padding: '10px',
      overflow: 'auto'
    }}>
      <div style={{
        backgroundColor: '#ffff99',
        padding: '10px',
        width: '500px',
        margin: '0 auto',
        border: '2px solid black'
      }}>
        <h1 style={{
          fontSize: '24px',
          color: '#ff0000',
          textAlign: 'center'
        }}>PEOPLE</h1>

        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: '#ff6666',
            padding: '5px 10px',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >BACK</button>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH NAME"
          style={{
            width: '100%',
            padding: '5px',
            backgroundColor: '#ffccff',
            border: '1px solid #00ff00',
            marginBottom: '10px'
          }}
        />

        {loading ? (
          <div style={{ textAlign: 'center', color: '#0000ff' }}>LOADING...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#ff0000' }}>NO PEOPLE FOUND</div>
        ) : (
          <div>
            {filteredUsers.map(user => (
              <div
                key={user.id}
                style={{
                  backgroundColor: '#99ff99',
                  border: '1px solid black',
                  padding: '10px',
                  margin: '5px 0'
                }}
              >
                <p style={{ color: '#0000ff' }}>{user.full_name}</p>
                <p style={{ color: '#ff00ff' }}>{user.username}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeoplePage;
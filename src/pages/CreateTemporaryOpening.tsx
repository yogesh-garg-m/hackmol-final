import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const CreateTemporaryOpening = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    await supabase
      .from('openings')
      .insert({
        title,
        description
      });
    setLoading(false);
    navigate('/homepage');
  };

  return (
    <div style={{
      backgroundColor: '#cccccc',
      height: '100vh',
      padding: '10px'
    }}>
      <div style={{
        backgroundColor: '#ffff99',
        padding: '10px',
        width: '400px',
        margin: '0 auto',
        border: '2px solid black'
      }}>
        <h1 style={{
          fontSize: '20px',
          color: '#ff0000',
          textAlign: 'center'
        }}>
          NEW OPENING
        </h1>

        <div style={{ margin: '10px 0' }}>
          <label style={{ display: 'block', color: '#0000ff' }}>TITLE:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '5px',
              border: '1px solid #00ff00',
              backgroundColor: '#ffccff'
            }}
          />
        </div>

        <div style={{ margin: '10px 0' }}>
          <label style={{ display: 'block', color: '#0000ff' }}>DESCRIPTION:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              height: '100px',
              padding: '5px',
              border: '1px solid #00ff00',
              backgroundColor: '#ffccff'
            }}
          />
        </div>

        <div style={{ textAlign: 'right' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#ff6666',
              border: 'none',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '5px 10px',
              backgroundColor: '#66ff66',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {loading ? 'LOADING...' : 'SUBMIT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTemporaryOpening;
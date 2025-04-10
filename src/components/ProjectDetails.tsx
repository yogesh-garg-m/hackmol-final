import React, { useState } from "react";

const ProjectDetails = ({ projectData, joinStatus, onJoin }) => {
  const [showFull, setShowFull] = useState(false);
  const { opening } = projectData;
  const { title, short_description } = opening || {};

  const renderJoinButton = () => {
    if (joinStatus === 'Owner') return <button style={{ backgroundColor: '#999999', padding: '5px', border: 'none' }}>OWNER</button>;
    if (joinStatus === 'Already Joined') return <button style={{ backgroundColor: '#999999', padding: '5px', border: 'none' }}>JOINED</button>;
    if (joinStatus === 'Active') return <button onClick={onJoin} style={{ backgroundColor: '#66ff66', padding: '5px', border: 'none', cursor: 'pointer' }}>JOIN</button>;
    return null;
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
        }}>{title || "NO TITLE"}</h1>

        <p style={{
          color: '#ff00ff',
          margin: '10px 0'
        }}>{showFull ? short_description : short_description?.slice(0, 50) + "..."}</p>

        {short_description?.length > 50 && (
          <button
            onClick={() => setShowFull(!showFull)}
            style={{
              backgroundColor: '#00ffff',
              padding: '5px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {showFull ? "LESS" : "MORE"}
          </button>
        )}

        <div style={{ marginTop: '10px' }}>
          {renderJoinButton()}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
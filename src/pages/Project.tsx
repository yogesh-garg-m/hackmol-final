import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Project = () => {
  const { opening_id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("openings")
        .select("title")
        .eq("opening_id", opening_id)
        .single();
      setTitle(data?.title || "NO TITLE");
      setLoading(false);
    };
    fetchProject();
  }, [opening_id]);

  const handleJoin = () => {
    alert("YOU JOINED!");
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
        }}>PROJECT</h1>

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

        {loading ? (
          <p style={{ color: '#0000ff', textAlign: 'center' }}>LOADING...</p>
        ) : (
          <div>
            <p style={{ color: '#ff00ff' }}>{title}</p>
            <button
              onClick={handleJoin}
              style={{
                backgroundColor: '#66ff66',
                padding: '5px 10px',
                border: 'none',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >JOIN</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Project;
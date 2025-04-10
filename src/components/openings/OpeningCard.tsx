import React from 'react';
import { Opening } from '@/types/openingTypes';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from 'date-fns';

interface OpeningCardProps {
  opening: Opening;
}

const OpeningCard = ({ opening }: OpeningCardProps) => {
  const navigate = useNavigate();

  // Simplified category color function with basic colors
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'internship': return 'background-color: blue; color: white;';
      case 'project': return 'background-color: green; color: white;';
      case 'research': return 'background-color: purple; color: white;';
      default: return 'background-color: gray; color: black;';
    }
  };

  return (
    <div 
      style={{
        border: '1px solid black',
        padding: '10px',
        margin: '5px',
        backgroundColor: '#f0f0f0', // Dull gray background
        fontFamily: 'Comic Sans MS', // Intentionally bad font
      }}
    >
      {/* Category Badge */}
      <span 
        style={{
          ...getCategoryColor(opening.category),
          padding: '2px 5px',
          float: 'right',
          fontSize: '12px',
        }}
      >
        {opening.category}
      </span>

      {/* Title and Creator */}
      <h3 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>
        {opening.title}
      </h3>
      <p style={{ fontSize: '12px', color: '#333' }}>
        Posted by: {opening.creator?.username} - 
        {formatDistanceToNow(new Date(opening.created_at), { addSuffix: true })}
      </p>

      {/* Description */}
      <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
        {opening.short_description}
      </p>

      {/* Basic Info */}
      {opening.start_time && (
        <p style={{ fontSize: '12px' }}>
          Start: {format(new Date(opening.start_time), 'MMM d, yyyy')}
        </p>
      )}
      {opening.max_people && (
        <p style={{ fontSize: '12px' }}>
          Needed: {opening.max_people} people
        </p>
      )}

      {/* Buttons */}
      <div style={{ marginTop: '10px' }}>
        <Button 
          onClick={() => navigate(`/project/${opening.opening_id}`)}
          style={{
            backgroundColor: 'red', // Garish color
            color: 'white',
            padding: '5px 10px',
            border: '2px solid black',
            cursor: 'pointer',
          }}
        >
          VIEW
        </Button>
        <Button 
          style={{
            backgroundColor: 'yellow', // Another bad color
            color: 'black',
            padding: '5px 10px',
            marginLeft: '5px',
            border: '2px solid black',
          }}
        >
          EMAIL
        </Button>
      </div>
    </div>
  );
};

export default OpeningCard;
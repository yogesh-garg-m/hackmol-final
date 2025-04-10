import { supabase } from '@/integrations/supabase/client';

export interface LostItem {
  id: number;
  user_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date_lost: string;
  contact_email: string;
  contact_phone?: string;
  image_base64: string;
  created_at?: string;
}

export interface FoundItem {
  id: number;
  user_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date_found: string;
  contact_email: string;
  contact_phone?: string;
  image_base64: string;
  created_at?: string;
}

export interface ItemDetails {
  id: number;
  user_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  contact_email: string;
  contact_phone?: string;
  imageUrl: string;
  status: 'lost' | 'found';
  matches?: ItemDetails[];
}

// Convert LostItem to ItemDetails
export const lostItemToDetails = (item: LostItem): ItemDetails => {
  return {
    id: item.id,
    user_id: item.user_id,
    title: item.title,
    description: item.description,
    category: item.category,
    location: item.location,
    date: item.date_lost,
    contact_email: item.contact_email,
    contact_phone: item.contact_phone,
    imageUrl: item.image_base64,
    status: 'lost'
  };
};

// Convert FoundItem to ItemDetails
export const foundItemToDetails = (item: FoundItem): ItemDetails => {
  return {
    id: item.id,
    user_id: item.user_id,
    title: item.title,
    description: item.description,
    category: item.category,
    location: item.location,
    date: item.date_found,
    contact_email: item.contact_email,
    contact_phone: item.contact_phone,
    imageUrl: item.image_base64,
    status: 'found'
  };
};

// Get all lost items
export const getLostItems = async (): Promise<ItemDetails[]> => {
  const { data, error } = await supabase
    .from('lost_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lost items:', error);
    throw error;
  }

  return data.map(lostItemToDetails);
};

// Get all found items
export const getFoundItems = async (): Promise<ItemDetails[]> => {
  const { data, error } = await supabase
    .from('found_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching found items:', error);
    throw error;
  }

  return data.map(foundItemToDetails);
};

// Get lost items by user ID
export const getLostItemsByUserId = async (userId: string): Promise<ItemDetails[]> => {
  const { data, error } = await supabase
    .from('lost_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user lost items:', error);
    throw error;
  }

  return data.map(lostItemToDetails);
};

// Get found items by user ID
export const getFoundItemsByUserId = async (userId: string): Promise<ItemDetails[]> => {
  const { data, error } = await supabase
    .from('found_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user found items:', error);
    throw error;
  }

  return data.map(foundItemToDetails);
};

// Add a lost item
export const addLostItem = async (item: Omit<LostItem, 'id' | 'created_at'>): Promise<ItemDetails> => {
  const { data, error } = await supabase
    .from('lost_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error('Error adding lost item:', error);
    throw error;
  }

  return lostItemToDetails(data);
};

// Add a found item
export const addFoundItem = async (item: Omit<FoundItem, 'id' | 'created_at'>): Promise<ItemDetails> => {
  const { data, error } = await supabase
    .from('found_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error('Error adding found item:', error);
    throw error;
  }

  return foundItemToDetails(data);
};

// Find potential matches for a lost item
export const findMatchesForLostItem = async (lostItem: ItemDetails): Promise<ItemDetails[]> => {
  // This is a simplified matching algorithm
  // In a real app, you might use more sophisticated matching logic
  const { data, error } = await supabase
    .from('found_items')
    .select('*')
    .eq('category', lostItem.category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error finding matches:', error);
    throw error;
  }

  return data.map(foundItemToDetails);
};

// Find potential matches for a found item
export const findMatchesForFoundItem = async (foundItem: ItemDetails): Promise<ItemDetails[]> => {
  // This is a simplified matching algorithm
  // In a real app, you might use more sophisticated matching logic
  const { data, error } = await supabase
    .from('lost_items')
    .select('*')
    .eq('category', foundItem.category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error finding matches:', error);
    throw error;
  }

  return data.map(lostItemToDetails);
}; 
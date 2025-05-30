import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface WatchHistory {
  id: string;
  profileId: string;
  contentId: string;
  watchTime: number;
  completed: boolean;
  lastWatched: string;
}

interface WatchHistoryState {
  history: WatchHistory[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: (profileId: string) => Promise<void>;
  updateWatchTime: (profileId: string, contentId: string, watchTime: number, completed?: boolean) => Promise<void>;
  getContinueWatching: () => WatchHistory[];
  clearError: () => void;
}

export const useWatchHistoryStore = create<WatchHistoryState>((set, get) => ({
  history: [],
  isLoading: false,
  error: null,

  fetchHistory: async (profileId: string) => {
    if (!profileId) {
      set({ error: 'Invalid profile ID' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('profile_id', profileId)
        .eq('completed', false)
        .order('last_watched', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedHistory = data.map(item => ({
        id: item.id,
        profileId: item.profile_id,
        contentId: item.content_id,
        watchTime: item.watch_time,
        completed: item.completed,
        lastWatched: item.last_watched
      }));

      set({ history: formattedHistory, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch watch history',
        isLoading: false 
      });
    }
  },

  updateWatchTime: async (profileId: string, contentId: string, watchTime: number, completed = false) => {
    if (!profileId) {
      set({ error: 'Invalid profile ID' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.rpc('update_watch_history', {
        p_profile_id: profileId,
        p_content_id: contentId,
        p_watch_time: watchTime,
        p_completed: completed
      });

      if (error) throw error;

      // Refresh history after update
      await get().fetchHistory(profileId);
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update watch time',
        isLoading: false 
      });
    }
  },

  getContinueWatching: () => {
    const { history } = get();
    return history.filter(item => !item.completed);
  },

  clearError: () => set({ error: null })
}));
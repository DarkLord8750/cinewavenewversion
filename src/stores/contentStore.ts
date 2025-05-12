import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface Content {
  id: string;
  title: string;
  description: string;
  type: 'movie' | 'series';
  genre: string[];
  releaseYear: number;
  maturityRating: string;
  duration: string;
  posterImage: string;
  backdropImage: string;
  trailerUrl: string;
  videoUrl480p?: string;
  videoUrl720p?: string;
  videoUrl1080p?: string;
  videoUrl4k?: string;
  featured: boolean;
  seasons?: Season[];
  cast: CastMember[];
  createdAt: string;
}

export interface Season {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: string;
  description?: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description?: string;
  duration?: string;
  thumbnail?: string;
  videoUrl480p?: string;
  videoUrl720p?: string;
  videoUrl1080p?: string;
  videoUrl4k?: string;
}

export interface CastMember {
  id: string;
  name: string;
  photoUrl: string;
  role: string;
}

interface ContentState {
  contents: Content[];
  featuredContents: Content[];
  myList: string[];
  isLoading: boolean;
  error: string | null;
  fetchContents: () => Promise<void>;
  fetchFeaturedContents: () => Promise<void>;
  getContentById: (id: string) => Content | undefined;
  getContentsByGenre: (genre: string) => Content[];
  addToMyList: (contentId: string) => void;
  removeFromMyList: (contentId: string) => void;
  isInMyList: (contentId: string) => boolean;
  getMyListContents: () => Content[];
  addContent: (content: Omit<Content, 'id' | 'cast' | 'createdAt'>) => Promise<void>;
  updateContent: (id: string, content: Partial<Content>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  addSeason: (contentId: string, season: { seasonNumber: number; title: string; description?: string }) => Promise<void>;
  updateSeason: (seasonId: string, season: Partial<Season>) => Promise<void>;
  deleteSeason: (seasonId: string) => Promise<void>;
  addEpisode: (seasonId: string, episode: Omit<Episode, 'id'>) => Promise<void>;
  updateEpisode: (episodeId: string, episode: Partial<Episode>) => Promise<void>;
  deleteEpisode: (episodeId: string) => Promise<void>;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      contents: [],
      featuredContents: [],
      myList: [],
      isLoading: false,
      error: null,

      fetchContents: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data: contents, error: contentError } = await supabase
            .from('content')
            .select(`
              *,
              content_genres (
                genres (name)
              ),
              content_cast (
                cast_member_id,
                role,
                order,
                cast_members (
                  id,
                  name,
                  photo_url
                )
              ),
              series (
                id,
                seasons (
                  *,
                  episodes (*)
                )
              )
            `)
            .order('created_at', { ascending: false });

          if (contentError) throw contentError;

          const formattedContents = contents.map(content => ({
            id: content.id,
            title: content.title,
            description: content.description,
            type: content.type,
            genre: content.content_genres.map(cg => cg.genres.name),
            releaseYear: content.release_year,
            maturityRating: content.maturity_rating,
            duration: content.duration,
            posterImage: content.poster_image,
            backdropImage: content.backdrop_image,
            trailerUrl: content.trailer_url,
            videoUrl480p: content.video_url_480p,
            videoUrl720p: content.video_url_720p,
            videoUrl1080p: content.video_url_1080p,
            videoUrl4k: content.video_url_4k,
            featured: content.featured,
            seasons: content.series?.[0]?.seasons || [],
            cast: content.content_cast
              .sort((a, b) => a.order - b.order)
              .map(cc => ({
                id: cc.cast_members.id,
                name: cc.cast_members.name,
                photoUrl: cc.cast_members.photo_url,
                role: cc.role
              })),
            createdAt: content.created_at
          }));

          set({ contents: formattedContents, isLoading: false });
          await get().fetchFeaturedContents();
        } catch (error) {
          console.error('Error fetching content:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch content', 
            isLoading: false 
          });
        }
      },

      fetchFeaturedContents: async () => {
        try {
          const { data: featured, error } = await supabase
            .from('content')
            .select(`
              *,
              content_genres (
                genres (name)
              ),
              content_cast (
                cast_member_id,
                role,
                order,
                cast_members (
                  id,
                  name,
                  photo_url
                )
              )
            `)
            .eq('featured', true)
            .order('featured_order', { ascending: true });

          if (error) throw error;

          const formattedFeatured = featured.map(content => ({
            id: content.id,
            title: content.title,
            description: content.description,
            type: content.type,
            genre: content.content_genres.map(cg => cg.genres.name),
            releaseYear: content.release_year,
            maturityRating: content.maturity_rating,
            duration: content.duration,
            posterImage: content.poster_image,
            backdropImage: content.backdrop_image,
            trailerUrl: content.trailer_url,
            videoUrl480p: content.video_url_480p,
            videoUrl720p: content.video_url_720p,
            videoUrl1080p: content.video_url_1080p,
            videoUrl4k: content.video_url_4k,
            featured: content.featured,
            cast: content.content_cast
              .sort((a, b) => a.order - b.order)
              .map(cc => ({
                id: cc.cast_members.id,
                name: cc.cast_members.name,
                photoUrl: cc.cast_members.photo_url,
                role: cc.role
              })),
            createdAt: content.created_at
          }));

          set({ featuredContents: formattedFeatured });
        } catch (error) {
          console.error('Error fetching featured content:', error);
        }
      },

      getContentById: (id: string) => {
        return get().contents.find(content => content.id === id);
      },

      getContentsByGenre: (genre: string) => {
        return get().contents.filter(content => 
          content.genre.includes(genre)
        );
      },

      addToMyList: (contentId: string) => {
        set(state => ({
          myList: [...state.myList, contentId]
        }));
      },

      removeFromMyList: (contentId: string) => {
        set(state => ({
          myList: state.myList.filter(id => id !== contentId)
        }));
      },

      isInMyList: (contentId: string) => {
        return get().myList.includes(contentId);
      },

      getMyListContents: () => {
        return get().contents.filter(content => 
          get().myList.includes(content.id)
        );
      },

      addContent: async (content) => {
        try {
          const { data, error } = await supabase.rpc('create_content_with_genres', {
            p_title: content.title,
            p_description: content.description,
            p_type: content.type,
            p_release_year: content.releaseYear,
            p_maturity_rating: content.maturityRating,
            p_duration: content.duration,
            p_poster_image: content.posterImage,
            p_backdrop_image: content.backdropImage,
            p_trailer_url: content.trailerUrl,
            p_featured: content.featured,
            p_genre_names: content.genre
          });

          if (error) throw error;
          await get().fetchContents();
        } catch (error) {
          console.error('Error adding content:', error);
          throw error;
        }
      },

      updateContent: async (id, content) => {
        try {
          const { error } = await supabase
            .from('content')
            .update({
              title: content.title,
              description: content.description,
              type: content.type,
              release_year: content.releaseYear,
              maturity_rating: content.maturityRating,
              duration: content.duration,
              poster_image: content.posterImage,
              backdrop_image: content.backdropImage,
              trailer_url: content.trailerUrl,
              featured: content.featured
            })
            .eq('id', id);

          if (error) throw error;

          if (content.genre) {
            const { error: genresError } = await supabase
              .from('content_genres')
              .delete()
              .eq('content_id', id);

            if (genresError) throw genresError;

            const { data: genres } = await supabase
              .from('genres')
              .select('id, name')
              .in('name', content.genre);

            if (genres && genres.length > 0) {
              const genreRelations = genres.map(genre => ({
                content_id: id,
                genre_id: genre.id
              }));

              const { error: insertError } = await supabase
                .from('content_genres')
                .insert(genreRelations);

              if (insertError) throw insertError;
            }
          }

          await get().fetchContents();
        } catch (error) {
          console.error('Error updating content:', error);
          throw error;
        }
      },

      deleteContent: async (id) => {
        try {
          const { error } = await supabase
            .from('content')
            .delete()
            .eq('id', id);

          if (error) throw error;
          
          set(state => ({
            contents: state.contents.filter(content => content.id !== id)
          }));
        } catch (error) {
          console.error('Error deleting content:', error);
          throw error;
        }
      },

      addSeason: async (contentId, season) => {
        try {
          const { data, error } = await supabase.rpc('create_season', {
            p_content_id: contentId,
            p_season_number: season.seasonNumber,
            p_title: season.title,
            p_description: season.description || ''
          });

          if (error) throw error;
          await get().fetchContents();
          return data;
        } catch (error) {
          console.error('Error adding season:', error);
          throw error;
        }
      },

      updateSeason: async (seasonId, season) => {
        try {
          const { error } = await supabase
            .from('seasons')
            .update({
              season_number: season.seasonNumber,
              title: season.title,
              description: season.description
            })
            .eq('id', seasonId);

          if (error) throw error;
          await get().fetchContents();
        } catch (error) {
          console.error('Error updating season:', error);
          throw error;
        }
      },

      deleteSeason: async (seasonId) => {
        try {
          const { error } = await supabase
            .from('seasons')
            .delete()
            .eq('id', seasonId);

          if (error) throw error;
          await get().fetchContents();
        } catch (error) {
          console.error('Error deleting season:', error);
          throw error;
        }
      },

      addEpisode: async (seasonId, episode) => {
        try {
          const { data, error } = await supabase.rpc('create_episode', {
            p_season_id: seasonId,
            p_episode_number: episode.episodeNumber,
            p_title: episode.title,
            p_description: episode.description || '',
            p_duration: episode.duration || '',
            p_thumbnail: episode.thumbnail || '',
            p_video_url_480p: episode.videoUrl480p,
            p_video_url_720p: episode.videoUrl720p,
            p_video_url_1080p: episode.videoUrl1080p,
            p_video_url_4k: episode.videoUrl4k
          });

          if (error) throw error;
          await get().fetchContents();
          return data;
        } catch (error) {
          console.error('Error adding episode:', error);
          throw error;
        }
      },

      updateEpisode: async (episodeId, episode) => {
        try {
          const { error } = await supabase
            .from('episodes')
            .update({
              episode_number: episode.episodeNumber,
              title: episode.title,
              description: episode.description,
              duration: episode.duration,
              thumbnail: episode.thumbnail,
              video_url_480p: episode.videoUrl480p,
              video_url_720p: episode.videoUrl720p,
              video_url_1080p: episode.videoUrl1080p,
              video_url_4k: episode.videoUrl4k
            })
            .eq('id', episodeId);

          if (error) throw error;
          await get().fetchContents();
        } catch (error) {
          console.error('Error updating episode:', error);
          throw error;
        }
      },

      deleteEpisode: async (episodeId) => {
        try {
          const { error } = await supabase
            .from('episodes')
            .delete()
            .eq('id', episodeId);

          if (error) throw error;
          await get().fetchContents();
        } catch (error) {
          console.error('Error deleting episode:', error);
          throw error;
        }
      }
    }),
    {
      name: 'netflix-content-storage',
      partialize: (state) => ({ myList: state.myList }),
    }
  )
);
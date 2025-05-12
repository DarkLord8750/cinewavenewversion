import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContentStore, Content } from '../stores/contentStore';
import { Play, Plus, Check } from 'lucide-react';
import VideoPlayer from '../components/common/VideoPlayer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuthStore } from '../stores/authStore';
import { useWatchHistoryStore } from '../stores/watchHistoryStore';

const MoviePage = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [content, setContent] = useState<Content | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams<{ id: string }>();
  const { currentProfile } = useAuthStore();
  const { fetchHistory } = useWatchHistoryStore();
  const { 
    contents, 
    fetchContents, 
    getContentById, 
    getContentsByGenre,
    addToMyList,
    removeFromMyList,
    isInMyList 
  } = useContentStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (contents.length === 0) {
          await fetchContents();
        }
        
        if (id) {
          const movieContent = getContentById(id);
          if (movieContent) {
            setContent(movieContent);
            
            // Get similar movies based on genre
            const similar = movieContent.genre
              .map(g => getContentsByGenre(g))
              .flat()
              .filter((c, i, arr) => 
                c.id !== movieContent.id && 
                arr.findIndex(item => item.id === c.id) === i
              )
              .slice(0, 12);
            setSimilarMovies(similar);

            if (currentProfile?.id) {
              await fetchHistory(currentProfile.id);
            }
          } else {
            navigate('/browse');
          }
        }
      } catch (error) {
        console.error('Error loading content:', error);
        navigate('/browse');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id, fetchContents, getContentById, contents.length, navigate, fetchHistory, currentProfile?.id]);

  const handlePlay = () => {
    setShowVideo(true);
    setIsFullscreen(true);
  };

  const handleClose = () => {
    if (isFullscreen) {
      setIsFullscreen(false);
    }
    setShowVideo(false);
  };

  const handleMyList = () => {
    if (!content) return;
    
    if (isInMyList(content.id)) {
      removeFromMyList(content.id);
    } else {
      addToMyList(content.id);
    }
  };

  const getVideoUrls = () => {
    if (!content) return {};
    return {
      '480p': content.videoUrl480p || '',
      '720p': content.videoUrl720p || '',
      '1080p': content.videoUrl1080p || '',
      '4k': content.videoUrl4k || ''
    };
  };

  if (isLoading || !content) {
    return <LoadingSpinner />;
  }

  const inMyList = isInMyList(content.id);

  return (
    <div className="min-h-screen bg-netflix-dark">
      {isFullscreen ? (
        <div className="fixed inset-0 z-50 bg-black">
          <VideoPlayer
            title={content.title}
            description={content.description}
            videoUrls={getVideoUrls()}
            contentId={content.id}
            onClose={handleClose}
            isFullScreen={true}
            autoPlay={true}
          />
        </div>
      ) : (
        <>
          <div className="relative w-full h-[56.25vw] max-h-[80vh]">
            <img 
              src={content.backdropImage} 
              alt={content.title}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
          </div>

          <div className="relative -mt-[150px] px-4 md:px-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-[300px] flex-shrink-0">
                <img
                  src={content.posterImage}
                  alt={content.title}
                  className="w-full rounded-md shadow-lg"
                />
              </div>

              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {content.title}
                </h1>

                <div className="flex items-center gap-4 mb-6 text-white">
                  <span>{content.releaseYear}</span>
                  <span className="border px-2 py-1 text-sm">
                    {content.maturityRating}
                  </span>
                  <span>{content.duration}</span>
                  <span className="px-2 py-1 border rounded">HD</span>
                </div>

                <div className="flex items-center gap-3 mb-8">
                  <button
                    onClick={handlePlay}
                    className="flex items-center gap-2 px-8 py-3 bg-white text-netflix-black rounded font-medium hover:bg-opacity-80 transition"
                  >
                    <Play size={24} fill="currentColor" />
                    Play
                  </button>
                  
                  <button
                    onClick={handleMyList}
                    className="flex items-center gap-2 px-8 py-3 bg-netflix-gray bg-opacity-50 text-white rounded font-medium hover:bg-opacity-40 transition"
                  >
                    {inMyList ? <Check size={24} /> : <Plus size={24} />}
                    {inMyList ? 'Remove from List' : 'My List'}
                  </button>
                </div>

                <p className="text-white text-lg mb-8">
                  {content.description}
                </p>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <span className="text-netflix-gray">Cast:</span>
                    <div className="text-white mt-2 flex flex-wrap gap-4">
                      {content.cast.map(member => (
                        <div key={member.id} className="flex items-center gap-2">
                          {member.photoUrl && (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-netflix-gray text-xs">{member.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-netflix-gray">Genres:</span>
                    <span className="text-white ml-2">{content.genre.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {similarMovies.length > 0 && (
            <section className="mt-12 px-4 md:px-12">
              <h2 className="text-2xl font-bold text-white mb-6">More Like This</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {similarMovies.map((movie) => (
                  <div 
                    key={movie.id} 
                    className="relative group cursor-pointer"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <img
                      src={movie.posterImage}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover rounded-md transition duration-300 group-hover:brightness-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                      <Play size={48} className="text-white" />
                    </div>
                    <div className="mt-2">
                      <h3 className="text-white font-medium group-hover:text-netflix-red transition">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-netflix-gray">
                        <span>{movie.releaseYear}</span>
                        <span>•</span>
                        <span>{movie.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default MoviePage;
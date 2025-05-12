import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash, Eye, Film, Tv } from 'lucide-react';
import { Content, useContentStore } from '../../stores/contentStore';
import { useGenreStore } from '../../stores/genreStore';
import SeriesManager from '../../components/admin/SeriesManager';
import ContentTable from '../../components/admin/ContentTable';

// Define ratings for the dropdown
const ratings = ["G", "PG", "PG-13", "R", "NC-17", "TV-Y", "TV-G", "TV-PG", "TV-14", "TV-MA"];

const ContentManagement = () => {
  const { contents, addContent, updateContent, deleteContent } = useContentStore();
  const { genres, fetchGenres } = useGenreStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add-movie' | 'add-series' | 'edit' | 'view'>('add-movie');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  const validateUrl = (url: string | null): boolean => {
    if (!url) return true; // Allow empty values
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleAddMovie = () => {
    setSelectedContent(null);
    setSelectedGenres([]);
    setModalMode('add-movie');
    setIsModalOpen(true);
    setValidationErrors({});
  };

  const handleAddSeries = () => {
    setSelectedContent(null);
    setSelectedGenres([]);
    setModalMode('add-series');
    setIsModalOpen(true);
    setValidationErrors({});
  };

  const handleEdit = (content: Content) => {
    setSelectedContent(content);
    setSelectedGenres(content.genre);
    setModalMode('edit');
    setIsModalOpen(true);
    setValidationErrors({});
  };

  const handleView = (id: string) => {
    const content = contents.find(c => c.id === id);
    if (content) {
      setSelectedContent(content);
      setSelectedGenres(content.genre);
      setModalMode('view');
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await deleteContent(id);
      } catch (error) {
        console.error('Failed to delete content:', error);
      }
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Validate URLs
    const errors: Record<string, string> = {};
    const urlFields = ['posterImage', 'backdropImage', 'trailerUrl', 'videoUrl480p', 'videoUrl720p', 'videoUrl1080p', 'videoUrl4k'];
    urlFields.forEach(field => {
      const url = formData.get(field) as string;
      if (url && !validateUrl(url)) {
        errors[field] = 'Please enter a valid URL starting with http:// or https://';
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const contentData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      type: modalMode === 'add-movie' ? 'movie' as const : 'series' as const,
      releaseYear: parseInt(formData.get('releaseYear') as string),
      maturityRating: formData.get('maturityRating') as string,
      duration: formData.get('duration') as string,
      posterImage: formData.get('posterImage') as string,
      backdropImage: formData.get('backdropImage') as string,
      trailerUrl: formData.get('trailerUrl') as string,
      videoUrl480p: formData.get('videoUrl480p') as string || null,
      videoUrl720p: formData.get('videoUrl720p') as string || null,
      videoUrl1080p: formData.get('videoUrl1080p') as string || null,
      videoUrl4k: formData.get('videoUrl4k') as string || null,
      featured: formData.get('featured') === 'on',
      genre: selectedGenres
    };

    try {
      setLoading(true);
      if (modalMode.startsWith('add')) {
        await addContent(contentData);
      } else if (selectedContent) {
        await updateContent(selectedContent.id, contentData);
      }
      setIsModalOpen(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Content Management</h1>
        <p className="text-gray-500">Manage movies and TV shows in your Netflix platform.</p>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAddMovie}
              className="flex items-center gap-2 bg-netflix-red text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition"
            >
              <Film size={16} />
              <span>Add Movie</span>
            </button>

            <button
              onClick={handleAddSeries}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition"
            >
              <Tv size={16} />
              <span>Add Series</span>
            </button>
          </div>
        </div>

        <ContentTable
          contents={contents}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {modalMode === 'add-movie' ? 'Add New Movie' :
                 modalMode === 'add-series' ? 'Add New Series' :
                 modalMode === 'edit' ? 'Edit Content' : 'View Content'}
              </h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={selectedContent?.title}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Release Year</label>
                  <input
                    type="number"
                    name="releaseYear"
                    defaultValue={selectedContent?.releaseYear || new Date().getFullYear()}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedContent?.description}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Maturity Rating</label>
                  <select
                    name="maturityRating"
                    defaultValue={selectedContent?.maturityRating || "PG-13"}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent"
                  >
                    {ratings.map(rating => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    defaultValue={selectedContent?.duration}
                    placeholder="e.g., 2h 15m"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent"
                  />
                </div>
              </div>

              {/* Media URLs */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Media</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Poster Image URL</label>
                    <input
                      type="url"
                      name="posterImage"
                      defaultValue={selectedContent?.posterImage}
                      required
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent ${
                        validationErrors.posterImage ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.posterImage && (
                      <p className="text-red-500 text-sm">{validationErrors.posterImage}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Backdrop Image URL</label>
                    <input
                      type="url"
                      name="backdropImage"
                      defaultValue={selectedContent?.backdropImage}
                      required
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent ${
                        validationErrors.backdropImage ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.backdropImage && (
                      <p className="text-red-500 text-sm">{validationErrors.backdropImage}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Trailer URL</label>
                  <input
                    type="url"
                    name="trailerUrl"
                    defaultValue={selectedContent?.trailerUrl}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent ${
                      validationErrors.trailerUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.trailerUrl && (
                    <p className="text-red-500 text-sm">{validationErrors.trailerUrl}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Video Quality URLs</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {['480p', '720p', '1080p', '4k'].map((quality) => (
                      <div key={quality} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{quality} URL</label>
                        <input
                          type="url"
                          name={`videoUrl${quality}`}
                          defaultValue={selectedContent?.[`videoUrl${quality}` as keyof Content]}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent ${
                            validationErrors[`videoUrl${quality}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {validationErrors[`videoUrl${quality}`] && (
                          <p className="text-red-500 text-sm">{validationErrors[`videoUrl${quality}`]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Genres</label>
                <div className="grid grid-cols-3 gap-2 border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
                  {genres.map(genre => (
                    <div key={genre.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`genre-${genre.id}`}
                        checked={selectedGenres.includes(genre.name)}
                        onChange={() => {
                          if (selectedGenres.includes(genre.name)) {
                            setSelectedGenres(prev => prev.filter(g => g !== genre.name));
                          } else {
                            setSelectedGenres(prev => [...prev, genre.name]);
                          }
                        }}
                        className="h-4 w-4 text-netflix-red focus:ring-netflix-red border-gray-300 rounded"
                      />
                      <label htmlFor={`genre-${genre.id}`} className="ml-2 text-sm text-gray-700">
                        {genre.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  defaultChecked={selectedContent?.featured}
                  className="h-4 w-4 text-netflix-red focus:ring-netflix-red border-gray-300 rounded"
                />
                <label htmlFor="featured" className="text-sm text-gray-700">
                  Featured content
                </label>
              </div>

              {/* Series Manager */}
              {selectedContent?.type === 'series' && modalMode !== 'add-series' && (
                <SeriesManager
                  contentId={selectedContent.id}
                  seasons={selectedContent.seasons || []}
                />
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedContent(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-netflix-red text-white rounded-md hover:bg-netflix-red/90 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : modalMode.startsWith('add') ? 'Add Content' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
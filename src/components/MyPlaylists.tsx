import { useEffect, useState, type FormEvent } from 'react';
import { useStore } from '@nanostores/react';
import { $userStore, $sessionStore } from '@clerk/astro/client';
import type { Playlist } from '@/lib/types/Playlist';

const MyPlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [firstSongId, setFirstSongId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const user = useStore($userStore);
  const session = useStore($sessionStore);

  useEffect(() => {
    const loadPlaylists = async () => {
      if (!user || !session) {
        setPlaylists([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/user-playlists.json');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
            data.details ||
            `Error fetching playlists: ${response.status}`
          );
        }
        setPlaylists(data || []);
      } catch (e: any) {
        console.error('Error loading playlists from API:', e);
        setError(e.message || 'Error al cargar playlists.');
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, [user, session]);

  const handleCreatePlaylist = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || !firstSongId.trim() || !user || !session) {
      setFormError(
        'Playlist name, a first song ID, and user session are required.'
      );
      return;
    }
    setFormLoading(true);
    setFormError(null);

    try {
      const response = await fetch('/api/user-playlists.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlaylistName,
          firstSongId: firstSongId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.details || `Server error: ${response.status}`
        );
      }

      setPlaylists((prevPlaylists) => [
        ...prevPlaylists,
        result as Playlist,
      ]);
      setNewPlaylistName('');
      setFirstSongId('');
    } catch (e: any) {
      console.error('Error creating playlist via Astro endpoint:', e);
      setFormError(e.message || 'Error al crear la playlist.');
    } finally {
      setFormLoading(false);
    }
  };

  if (!user && !loading && !error) {
    return (
      <p className='p-4'>Please sign in to view and manage your playlists.</p>
    );
  }
  if (error && error === 'Configuración de Supabase incompleta.') {
    return <p className='p-4 text-red-500'>Error: {error}</p>;
  }

  return (
    <div className='p-4'>
      <h1 className='mb-4 text-2xl font-bold'>My Playlists</h1>
      {loading && <p>Loading playlists...</p>}
      {error && (
        <p className='text-red-500'>Error loading playlists: {error}</p>
      )}

      {!loading && playlists.length > 0 && (
        <ul className='mb-6 list-none pl-0'>
          {playlists.map((playlist) => (
            <li
              key={playlist.id}
              className='mb-2 flex items-center rounded-md p-3 shadow'
              style={{ borderLeft: `6px solid ${playlist.color || '#4A5568'}` }}
            >
              {playlist.cover_art_url && (
                <img
                  src={playlist.cover_art_url}
                  alt={`Cover for ${playlist.name}`}
                  className='mr-3 h-12 w-12 rounded object-cover'
                />
              )}
              {!playlist.cover_art_url && (
                <div className='mr-3 flex h-12 w-12 items-center justify-center rounded bg-gray-700 text-xl'>
                  🎵
                </div>
              )}
              <span className='font-semibold'>{playlist.name}</span>
            </li>
          ))}
        </ul>
      )}
      {!loading && playlists.length === 0 && !error && user && (
        <p>You don't have any playlists yet.</p>
      )}

      {user && (
        <form
          onSubmit={handleCreatePlaylist}
          className='mt-8 rounded-lg border border-gray-700 p-4'
        >
          <h2 className='mb-3 text-xl font-semibold'>Create New Playlist</h2>
          {formError && <p className='mb-3 text-red-500'>Error: {formError}</p>}
          <div className='mb-3'>
            <label
              htmlFor='playlistName'
              className='mb-1 block text-sm font-medium text-gray-300'
            >
              Playlist Name
            </label>
            <input
              id='playlistName'
              type='text'
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder='My Awesome Mix'
              className='w-full rounded border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring-blue-500'
              required
            />
          </div>
          <div className='mb-4'>
            <label
              htmlFor='firstSongId'
              className='mb-1 block text-sm font-medium text-gray-300'
            >
              First Song ID (UUID)
            </label>
            <input
              id='firstSongId'
              type='text'
              value={firstSongId}
              onChange={(e) => setFirstSongId(e.target.value)}
              placeholder='Enter the ID of the first song'
              className='w-full rounded border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring-blue-500'
              required
            />
            <p className='mt-1 text-xs text-gray-500'>
              This will set the playlist's initial cover and color.
            </p>
          </div>
          <button
            type='submit'
            disabled={formLoading}
            className='w-full rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 disabled:opacity-50'
          >
            {formLoading ? 'Creating...' : 'Create Playlist'}
          </button>
        </form>
      )}
    </div>
  );
};

export default MyPlaylists;

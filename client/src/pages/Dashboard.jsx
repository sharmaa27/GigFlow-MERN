import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/gigs?search=${search}`);
      setGigs(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch gigs. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [search]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Open Gigs</h1>
        <Link to="/create-gig" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          + Post a Job
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by title..."
        className="w-full p-3 border rounded mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Loading & Error States */}
      {loading && <p className="text-gray-500">Loading gigs...</p>}
      
      {error && <p className="text-red-500 font-bold">{error}</p>}
      
      {!loading && !error && gigs.length === 0 && (
        <div className="text-center mt-10">
          <p className="text-xl text-gray-600">No gigs found yet.</p>
          <p className="text-gray-500">Be the first to post one!</p>
        </div>
      )}

      {/* Gigs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gigs.map((gig) => (
          <div key={gig._id} className="border p-4 rounded shadow hover:shadow-lg transition bg-white">
            <h3 className="text-xl font-bold mb-2">{gig.title}</h3>
            <p className="text-gray-600 truncate mb-4">{gig.description}</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-green-600">${gig.budget}</span>
              <Link to={`/gigs/${gig._id}`} className="text-blue-500 hover:underline">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
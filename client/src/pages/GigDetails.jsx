import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function GigDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);

  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gigRes = await axios.get('/api/gigs'); 
        const foundGig = gigRes.data.find(g => g._id === id);
        setGig(foundGig);

        if (user && foundGig && user.id === foundGig.ownerId._id) {
          const bidRes = await axios.get(`/api/bids/${id}`);
          setBids(bidRes.data);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };
    fetchData();
  }, [id, user]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      const bidData = { gigId: id, message, price: Number(price) };
      
      await axios.post('/api/bids', bidData, { withCredentials: true });

      alert("SUCCESS! Your bid has been placed.");
      window.location.reload(); 

    } catch (err) {
      console.error("Bid Error:", err);
      const errorMsg = err.response?.data?.error;
      
      if (errorMsg === "You have already bid on this gig") {
        alert("GOOD NEWS: You already bid on this! (The error is actually a success message)");
      } else {
        toast.error(errorMsg || 'Failed to bid');
      }
    }
  };
  
  const handleHire = async (bidId) => {
    try {
      await axios.patch(`/api/bids/${bidId}/hire`, {}, { withCredentials: true });
      toast.success('Freelancer hired!');
      window.location.reload(); 
    } catch (err) {
      toast.error(err.response?.data?.error || 'Hiring failed');
    }
  };

  if (!gig) return <div className="p-10 text-center">Loading...</div>;

  const isOwner = user?.id === gig.ownerId._id;

  return (
    <div className="container mx-auto p-6">
      {/* Gig Header */}
      <div className="bg-white p-6 rounded shadow mb-6 border">
        <h1 className="text-3xl font-bold mb-2">{gig.title}</h1>
        <p className="text-gray-700 mb-4">{gig.description}</p>
        <div className="flex items-center gap-4">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-bold">
            Budget: ${gig.budget}
          </span>
          <span className={`px-3 py-1 rounded font-bold ${gig.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
            Status: {gig.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* --- SCENARIO 1: OWNER VIEW (See Bids) --- */}
      {isOwner && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Bids Received ({bids.length})</h2>
          {bids.length === 0 ? <p className="text-gray-500">No bids yet.</p> : (
            <div className="space-y-3">
              {bids.map(bid => (
                <div key={bid._id} className="border p-4 rounded bg-white shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">{bid.freelancerId?.name || "Freelancer"} <span className="text-green-600">(${bid.price})</span></p>
                    <p className="text-gray-600 italic">"{bid.message}"</p>
                    <p className="text-sm mt-1">Status: 
                      <span className={`ml-1 font-bold ${bid.status === 'hired' ? 'text-green-600' : 'text-gray-500'}`}>
                        {bid.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  
                  {gig.status === 'open' && (
                    <button 
                      onClick={() => handleHire(bid._id)}
                      className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
                    >
                      Hire
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- SCENARIO 2: FREELANCER VIEW (Place Bid) --- */}
      {!isOwner && gig.status === 'open' && (
        <div className="mt-6 border p-6 rounded bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Place a Bid</h2>
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Cover Letter</label>
              <textarea
                placeholder="Why are you a good fit?"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={message} onChange={e => setMessage(e.target.value)}
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Your Price ($)</label>
              <input
                type="number"
                placeholder="500"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={price} onChange={e => setPrice(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700 transition">
              Submit Proposal
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CreateGig() {
  const [form, setForm] = useState({ title: '', description: '', budget: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/gigs', form, { withCredentials: true });
      
      toast.success('Gig posted successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate('/login');
      } else {
        toast.error("Failed to post gig. Check console.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Post a New Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Job Title</label>
          <input 
            type="text" 
            placeholder="e.g. Build a React Website" 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })} 
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea 
            placeholder="Describe the job requirements..." 
            className="w-full p-2 border rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Budget ($)</label>
          <input 
            type="number" 
            placeholder="500" 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.budget} 
            onChange={(e) => setForm({ ...form, budget: e.target.value })} 
            required
          />
        </div>

        <button type="submit" className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700 transition">
          Post Gig
        </button>
      </form>
    </div>
  );
}
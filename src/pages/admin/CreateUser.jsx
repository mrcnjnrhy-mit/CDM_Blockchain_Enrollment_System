import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ModuleBackButton from '../../components/ModuleBackButton';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function CreateUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'registrar' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', form);
      toast.success('User created');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create user failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="max-w-md mx-auto p-6">
        <ModuleBackButton />
        <h2 className="text-2xl font-bold mb-4">Create User (admin only)</h2>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
            className="w-full border px-4 py-2 rounded-lg" placeholder="Full name" />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
            className="w-full border px-4 py-2 rounded-lg" placeholder="Email" />
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
            className="w-full border px-4 py-2 rounded-lg" placeholder="Password" />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full border px-4 py-2 rounded-lg">
            <option value="registrar">Registrar</option>
            <option value="cashier">Cashier</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">Create</button>
        </form>
      </div>
    </div>
  );
}

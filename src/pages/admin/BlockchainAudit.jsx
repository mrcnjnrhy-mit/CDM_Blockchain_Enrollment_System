import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function BlockchainAudit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chain, setChain]       = useState([]);
  const [validity, setValidity] = useState(null);

  useEffect(() => {
    API.get('/blockchain/chain').then(r => setChain(r.data)).catch(() => {});
  }, []);

  const verify = async () => {
    try {
      const { data } = await API.get('/blockchain/verify');
      setValidity(data);
      toast[data.isValid ? 'success' : 'error'](
        data.isValid ? '✅ Chain is VALID' : '❌ Chain TAMPERED!'
      );
    } catch {
      toast.error('Verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-56 md:pl-64">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Blockchain Audit Trail</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={verify}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
            >
              🔍 Verify Integrity
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/create-user')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                ➕ Create User
              </button>
            )}
          </div>
        </div>

        {validity && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-semibold ${
            validity.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {validity.isValid ? '✅ All blocks valid' : '❌ Tampering detected!'} —
            Total Blocks: {validity.totalBlocks}
          </div>
        )}

        {chain.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow">
            No blockchain records yet. Submit an enrollment first.
          </div>
        ) : (
          <div className="space-y-3">
            {chain.map(block => (
              <div key={block._id} className="bg-white rounded-xl shadow p-4 font-mono text-xs">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-blue-600 text-sm">Block #{block.blockIndex}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    block.recordType === 'ENROLLMENT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {block.recordType}
                  </span>
                </div>
                <p className="text-gray-500">
                  🕐 {new Date(block.timestamp).toLocaleString()}
                </p>
                <p className="text-green-700 break-all mt-1">
                  Hash: {block.hash}
                </p>
                <p className="text-gray-400 break-all">
                  Prev: {block.previousHash}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
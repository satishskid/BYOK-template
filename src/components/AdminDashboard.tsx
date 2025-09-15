import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { firebaseConfigService } from '../services/firebaseConfig';

interface WhitelistUser {
  email: string;
  isWhitelisted: boolean;
  role?: string;
  addedAt: string;
  addedBy: string;
  lastLogin?: string;
}

interface WhitelistRequest {
  id: string;
  email: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedBy?: string;
  processedAt?: string;
}

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [whitelistedUsers, setWhitelistedUsers] = useState<WhitelistUser[]>([]);
  const [whitelistRequests, setWhitelistRequests] = useState<WhitelistRequest[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [selectedTab, setSelectedTab] = useState<'users' | 'requests' | 'domains' | 'analytics'>('users');
  
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingRequests: 0,
    rejectedRequests: 0
  });

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    if (isAuthenticated) {
      loadWhitelistData();
      loadAnalytics();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      
      // Check if user is admin
      const adminDoc = doc(db, 'admins', adminEmail);
      const adminSnapshot = await getDoc(adminDoc);
      
      if (!adminSnapshot.exists()) {
        setError('Access denied. Admin privileges required.');
        await signOut(auth);
        return;
      }

      setIsAuthenticated(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadWhitelistData = async () => {
    try {
      // Load whitelisted users
      const usersSnapshot = await getDocs(collection(db, 'whitelist', 'users'));
      const users: WhitelistUser[] = [];
      usersSnapshot.forEach(doc => {
        users.push({ email: doc.id, ...doc.data() } as WhitelistUser);
      });
      setWhitelistedUsers(users);

      // Load whitelist requests
      const requestsSnapshot = await getDocs(collection(db, 'whitelist_requests'));
      const requests: WhitelistRequest[] = [];
      requestsSnapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() } as WhitelistRequest);
      });
      setWhitelistRequests(requests);
    } catch (error) {
      console.error('Error loading whitelist data:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'whitelist', 'users'));
      const requestsSnapshot = await getDocs(collection(db, 'whitelist_requests'));
      
      const users = usersSnapshot.docs.length;
      const activeUsers = usersSnapshot.docs.filter(doc => doc.data().lastLogin).length;
      const pending = requestsSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
      const rejected = requestsSnapshot.docs.filter(doc => doc.data().status === 'rejected').length;

      setAnalytics({
        totalUsers: users,
        activeUsers,
        pendingRequests: pending,
        rejectedRequests: rejected
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const addToWhitelist = async (email: string) => {
    if (!email) return;
    
    try {
      await setDoc(doc(db, 'whitelist', 'users', email), {
        email,
        isWhitelisted: true,
        role: 'user',
        addedAt: serverTimestamp(),
        addedBy: adminEmail
      });
      
      await loadWhitelistData();
      setNewEmail('');
    } catch (error) {
      console.error('Error adding to whitelist:', error);
    }
  };

  const removeFromWhitelist = async (email: string) => {
    try {
      await deleteDoc(doc(db, 'whitelist', 'users', email));
      await loadWhitelistData();
    } catch (error) {
      console.error('Error removing from whitelist:', error);
    }
  };

  const processWhitelistRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const requestRef = doc(db, 'whitelist_requests', requestId);
      const request = whitelistRequests.find(r => r.id === requestId);
      
      if (!request) return;

      await updateDoc(requestRef, {
        status: action,
        processedBy: adminEmail,
        processedAt: serverTimestamp()
      });

      if (action === 'approve') {
        await addToWhitelist(request.email);
      }

      await loadWhitelistData();
    } catch (error) {
      console.error('Error processing request:', error);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setAdminEmail('');
      setAdminPassword('');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-gray-600 mt-2">Access whitelist management dashboard</p>
          </div>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BYOK Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage whitelist users and requests</p>
            </div>
            <button
              onClick={handleAdminLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Sign Out
            </button>
            <button
              onClick={onClose}
              className="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{analytics.activeUsers}</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">{analytics.pendingRequests}</div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">{analytics.rejectedRequests}</div>
            <div className="text-sm text-gray-600">Rejected Requests</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            {[
              { id: 'users', label: 'Whitelisted Users' },
              { id: 'requests', label: 'Pending Requests' },
              { id: 'domains', label: 'Domain Whitelist' },
              { id: 'analytics', label: 'Analytics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content based on selected tab */}
        <div className="bg-white rounded-lg shadow">
          {selectedTab === 'users' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Whitelisted Users</h3>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Add email to whitelist"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => addToWhitelist(newEmail)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                  >
                    Add User
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {whitelistedUsers.map(user => (
                      <tr key={user.email}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role || 'user'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.addedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => removeFromWhitelist(user.email)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'requests' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Whitelist Requests</h3>
              
              <div className="space-y-4">
                {whitelistRequests.filter(r => r.status === 'pending').map(request => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{request.email}</p>
                        <p className="text-sm text-gray-600">
                          Requested: {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => processWhitelistRequest(request.id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => processWhitelistRequest(request.id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'domains' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Domain Whitelist</h3>
              <p className="text-gray-600 mb-4">Manage domain-based whitelisting</p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Domain whitelist feature coming soon. Currently supports email-based whitelisting.
                </p>
              </div>
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Dashboard</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">User Activity</h4>
                  <p className="text-sm text-gray-600">Track user engagement and login patterns</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Request Processing</h4>
                  <p className="text-sm text-gray-600">Monitor whitelist request approval rates</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
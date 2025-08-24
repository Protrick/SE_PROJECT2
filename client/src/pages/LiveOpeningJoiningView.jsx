import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TeamContext } from '../context/TeamContext'
import { AppContext } from '../context/AppContext'

const LiveOpeningJoiningView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const teamId = params.get('teamId');
  const { getTeamById, withdrawApplication, loading } = useContext(TeamContext);
  const { userdata } = useContext(AppContext);
  const [team, setTeam] = useState(null);
  const [userApplication, setUserApplication] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const fetchTeam = async () => {
    setLoadingTeam(true);
    const teamData = await getTeamById(teamId);
    setTeam(teamData);

    // Find current user's application using authenticated user from AppContext
    const currentUserId = userdata?._id;
    const application = teamData?.applicants?.find(app =>
      String(app.user?._id ?? app.user) === String(currentUserId)
    );
    setUserApplication(application);
    setLoadingTeam(false);
  }

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  const onWithdraw = async () => {
    const applicantId = String(userApplication?.user?._id ?? userApplication?.user);
    const success = await withdrawApplication(teamId, applicantId);
    if (success) {
      navigate('/applied-teams');
    }
  }

  if (loadingTeam) {
    return (
      <div className="p-6 max-w-4xl mx-auto pt-24">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6 max-w-4xl mx-auto pt-24">
        <div className="text-center py-8">
          <p className="text-red-600">Team not found</p>
          <button onClick={() => navigate('/applied-teams')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Applied Teams
          </button>
        </div>
      </div>
    );
  }

  const getApplicationStatus = () => {
    if (!userApplication) return 'Not Applied';
    if (team.members?.some(member => member._id === userApplication.user._id)) return 'Accepted';
    return 'Pending';
  }

  const applicationStatus = getApplicationStatus();
  const isAccepted = applicationStatus === 'Accepted';
  const isPending = applicationStatus === 'Pending';

  return (
    <div className="p-6 max-w-4xl mx-auto pt-24">
      <div className="mb-6">
        <button onClick={() => navigate('/applied-teams')} className="text-blue-600 hover:text-blue-800 mb-4">
          ← Back to Applied Teams
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{team.name}</h2>
              <p className="text-gray-600 mb-4">{team.description || 'No description provided'}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-600 font-medium">Team Members</p>
                  <p className="text-xl font-bold text-blue-800">{team.members?.length || 0}/{team.maxMembers || 2}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-600 font-medium">Domain</p>
                  <p className="text-lg font-semibold text-green-800 capitalize">{team.domain}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-purple-600 font-medium">Creator</p>
                  <p className="text-lg font-semibold text-purple-800">{team.creator?.name || 'Unknown'}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-yellow-600 font-medium">Applications</p>
                  <p className="text-xl font-bold text-yellow-800">{team.applicants?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${isAccepted ? 'bg-green-100 text-green-800' :
                isPending ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
              }`}>
              {applicationStatus}
            </div>
          </div>
        </div>
      </div>

      {userApplication && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Your Application</h3>
          </div>
          <div className="p-6">
            {isAccepted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-green-800">Congratulations! You've been accepted to this team.</p>
                    <p className="text-green-700 text-sm">You are now a member of {team.name}.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-yellow-800">Your application is pending review.</p>
                    <p className="text-yellow-700 text-sm">The team creator will review your application soon.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                <a
                  href={userApplication.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                  View LinkedIn Profile
                </a>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile</label>
                <a
                  href={userApplication.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  View GitHub Profile
                </a>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume</label>
                <a
                  href={userApplication.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Resume
                </a>
              </div>

              <div className="text-sm text-gray-500 pt-2">
                Applied on {new Date(userApplication.appliedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {isPending && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  disabled={loading}
                  onClick={onWithdraw}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? 'Withdrawing...' : 'Withdraw Application'}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  You can withdraw your application anytime before it's reviewed.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {team.members && team.members.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">Team Members</h3>
          </div>
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {team.members.map(member => (
                <div key={member._id} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.name?.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{member.name}</p>
                    <p className="text-gray-600 text-sm">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveOpeningJoiningView

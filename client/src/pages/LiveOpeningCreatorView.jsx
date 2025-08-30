import React, { useState, useContext, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TeamContext } from '../context/TeamContext'

const LiveOpeningCreatorView = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { getTeamById, acceptApplicant, rejectApplicant, loading } = useContext(TeamContext);
  const [team, setTeam] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [expandedApplicant, setExpandedApplicant] = useState(null);

  const fetchTeam = async () => {
    setLoadingTeam(true);
    const teamData = await getTeamById(teamId);
    setTeam(teamData);
    setLoadingTeam(false);
  }

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  const onAccept = async (userId) => {
    const success = await acceptApplicant(teamId, userId);
    if (success) {
      fetchTeam(); // refresh
      setExpandedApplicant(null); // collapse expanded view
    }
  }

  const onReject = async (userId) => {
    const success = await rejectApplicant(teamId, userId);
    if (success) {
      fetchTeam(); // refresh
      setExpandedApplicant(null); // collapse expanded view
    }
  }

  const toggleApplicantDetails = (applicantId) => {
    setExpandedApplicant(expandedApplicant === applicantId ? null : applicantId);
  }

  if (loadingTeam) {
    return (
      <div className="p-6 max-w-6xl mx-auto pt-24">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6 max-w-6xl mx-auto pt-24">
        <div className="text-center py-8">
          <p className="text-red-600">Team not found</p>
          <button onClick={() => navigate('/created-teams')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to My Teams
          </button>
        </div>
      </div>
    );
  }

  const pendingApplicants = team.applicants || [];
  const acceptedCount = team.members?.length || 0;
  const isTeamFull = acceptedCount >= (team.maxMembers || 2);

  return (
    <div className="p-6 max-w-6xl mx-auto pt-24">
      <div className="mb-6">
        <button onClick={() => navigate('/created-teams')} className="text-blue-600 hover:text-blue-800 mb-4">
          ← Back to My Teams
        </button>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{team.name}</h2>
          <p className="text-gray-600 mb-4">{team.description || 'No description provided'}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-600 font-medium">Team Members</p>
              <p className="text-xl font-bold text-blue-800">{acceptedCount}/{team.maxMembers || 2}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-yellow-600 font-medium">Pending Applications</p>
              <p className="text-xl font-bold text-yellow-800">{pendingApplicants.length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-600 font-medium">Domain</p>
              <p className="text-lg font-semibold text-green-800 capitalize">{team.domain}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-purple-600 font-medium">Status</p>
              <p className={`text-lg font-semibold ${isTeamFull ? 'text-red-600' : 'text-green-600'}`}>
                {isTeamFull ? 'Full' : 'Open'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Recruitment Center ({pendingApplicants.length} candidates to review)
          </h3>
          <p className="text-sm text-gray-600 mt-1">Click on any applicant to analyze their profile and make recruitment decisions</p>
          {isTeamFull && (
            <p className="text-amber-600 text-sm mt-2 bg-amber-50 p-2 rounded">
              ⚠️ Your team is full. You can still review applications, but accepting new members will exceed the limit.
            </p>
          )}
        </div>

        <div className="p-6">
          {pendingApplicants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-medium">No candidates to review</p>
              <p className="text-sm mt-1">When users apply to join your team, they'll appear here for analysis</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApplicants.map(applicant => (
                <div key={applicant.user._id} className="border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200">
                  {/* Compact View */}
                  <div className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {applicant.user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-800">{applicant.user.name}</h4>
                          <p className="text-gray-600">{applicant.user.email}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Applied {new Date(applicant.appliedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleApplicantDetails(applicant.user._id)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          {expandedApplicant === applicant.user._id ? 'Hide Details' : 'Analyze Profile'}
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => onAccept(applicant.user._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                          {loading ? 'Recruiting...' : '✓ Recruit'}
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => onReject(applicant.user._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                          {loading ? 'Processing...' : '✗ Reject'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Analysis View */}
                  {expandedApplicant === applicant.user._id && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6">
                        <h5 className="font-semibold text-gray-800 mb-4">📋 Profile Analysis</h5>

                        <div className="grid md:grid-cols-3 gap-6">
                          {/* LinkedIn Analysis */}
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium text-gray-800">LinkedIn Profile</span>
                            </div>
                            <a
                              href={applicant.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium"
                            >
                              View Professional Profile
                            </a>
                            <p className="text-xs text-gray-500 mt-2">Review their professional experience, connections, and endorsements</p>
                          </div>

                          {/* GitHub Analysis */}
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium text-gray-800">GitHub Portfolio</span>
                            </div>
                            <a
                              href={applicant.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-center font-medium"
                            >
                              View Code Repository
                            </a>
                            <p className="text-xs text-gray-500 mt-2">Analyze coding skills, project quality, and contribution history</p>
                          </div>

                          {/* Resume Analysis */}
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="font-medium text-gray-800">Resume</span>
                            </div>
                            <a
                              href={applicant.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-center font-medium"
                            >
                              View Full Resume
                            </a>
                            <p className="text-xs text-gray-500 mt-2">Review education, work experience, and achievements</p>
                          </div>
                        </div>

                        {/* Recruitment Action Panel */}
                        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                          <h6 className="font-semibold text-gray-800 mb-3">🎯 Recruitment Decision</h6>
                          <div className="flex gap-4">
                            <button
                              disabled={loading}
                              onClick={() => onAccept(applicant.user._id)}
                              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {loading ? 'Recruiting...' : 'Recruit This Candidate'}
                            </button>
                            <button
                              disabled={loading}
                              onClick={() => onReject(applicant.user._id)}
                              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              {loading ? 'Processing...' : 'Decline Application'}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Take your time to review all materials before making a decision
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {team.members && team.members.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">🏆 Current Team Members</h3>
          </div>
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {team.members.map(member => (
                <div key={member._id} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.name?.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{member.name}</p>
                    <p className="text-gray-600 text-sm">{member.email}</p>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                      Team Member
                    </span>
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

export default LiveOpeningCreatorView

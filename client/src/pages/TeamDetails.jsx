import React, { useState, useContext, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TeamContext } from '../context/TeamContext'

const TeamDetails = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { getTeamById, loading } = useContext(TeamContext);
    const [team, setTeam] = useState(null);
    const [loadingTeam, setLoadingTeam] = useState(true);

    const fetchTeam = async () => {
        setLoadingTeam(true);
        const teamData = await getTeamById(teamId);
        setTeam(teamData);
        setLoadingTeam(false);
    }

    useEffect(() => {
        fetchTeam();
    }, [teamId]);

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
                    <button onClick={() => navigate('/created-teams')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Back to My Teams
                    </button>
                </div>
            </div>
        );
    }

    const totalApplicants = team.applicants?.length || 0;
    const pendingApplicants = team.applicants?.filter(app => app.status !== 'accepted' && app.status !== 'rejected')?.length || 0;
    const acceptedCount = team.members?.length || 0;
    const isTeamFull = acceptedCount >= (team.maxMembers || 2);

    return (
        <div className="p-6 max-w-4xl mx-auto pt-24">
            <div className="mb-6">
                <button onClick={() => navigate('/created-teams')} className="text-blue-600 hover:text-blue-800 mb-4">
                    ← Back to My Teams
                </button>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">{team.name}</h2>
                            <p className="text-gray-600 text-lg">{team.description || 'No description provided'}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(`/live-opening-creator-view/${team._id}`)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Manage Applications
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-blue-600 font-medium">Team Members</p>
                                    <p className="text-2xl font-bold text-blue-800">{acceptedCount}/{team.maxMembers || 2}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-yellow-600 font-medium">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-800">{pendingApplicants}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-green-600 font-medium">Domain</p>
                                    <p className="text-lg font-semibold text-green-800 capitalize">{team.domain}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isTeamFull ? 'bg-red-600' : 'bg-green-600'}`}>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isTeamFull ? "M6 18L18 6M6 6l12 12" : "M5 13l4 4L19 7"} />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-purple-600 font-medium">Status</p>
                                    <p className={`text-lg font-semibold ${isTeamFull ? 'text-red-600' : 'text-green-600'}`}>
                                        {isTeamFull ? 'Full' : 'Open'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Team Information</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Created:</span>
                                <span className="ml-2 font-medium">{new Date(team.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Total Applications:</span>
                                <span className="ml-2 font-medium">{totalApplicants}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Recruiting Status:</span>
                                <span className={`ml-2 font-medium ${team.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                    {team.isOpen ? 'Actively Recruiting' : 'Closed for Applications'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Max Team Size:</span>
                                <span className="ml-2 font-medium">{team.maxMembers || 2} members</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {team.members && team.members.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800">Team Members</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            {team.members.map(member => (
                                <div key={member._id} className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {member.name?.charAt(0).toUpperCase() || 'M'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{member.name}</p>
                                        <p className="text-gray-600 text-sm">{member.email}</p>
                                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                                            Active Member
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {pendingApplicants > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Pending Applications</h3>
                                <p className="text-gray-600 text-sm">You have {pendingApplicants} application{pendingApplicants !== 1 ? 's' : ''} waiting for review</p>
                            </div>
                            <button
                                onClick={() => navigate(`/live-opening-creator-view/${team._id}`)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Review Applications
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TeamDetails

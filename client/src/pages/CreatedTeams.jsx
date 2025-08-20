import React, { useEffect, useContext } from 'react'
import { TeamContext } from '../context/TeamContext'
import { useNavigate } from 'react-router-dom'

const CreatedTeams = () => {
    const { createdTeams, getCreatedTeams, loading } = useContext(TeamContext);
    const navigate = useNavigate();

    useEffect(() => {
        getCreatedTeams();
    }, []);

    if (loading) return <div className="p-6 text-center">Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto pt-24">
            <h2 className="text-2xl font-semibold mb-4">My Created Teams</h2>
            {createdTeams.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No teams created yet</p>
                    <button
                        onClick={() => navigate('/create-team')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Create Your First Team
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {createdTeams.map(team => (
                        <div key={team._id} className="border p-4 rounded-lg shadow-sm bg-white">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="font-semibold text-lg text-gray-800">{team.name}</div>
                                    <div className="text-sm text-gray-600 mt-1">{team.description}</div>
                                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                        <span>Domain: <span className="font-medium">{team.domain}</span></span>
                                        <span>Members: <span className="font-medium">{team.members?.length || 0}/{team.maxMembers || 2}</span></span>
                                        <span>Applicants: <span className="font-medium">{team.applicants?.length || 0}</span></span>
                                        <span className={`font-medium ${team.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                            {team.isOpen ? 'Open' : 'Closed'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => navigate(`/live-opening-creator-view/${team._id}`)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                    >
                                        Manage Applications
                                    </button>
                                    <button
                                        onClick={() => navigate(`/team/${team._id}`)}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CreatedTeams

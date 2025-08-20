import React, { useEffect, useState, useContext } from 'react'
import { TeamContext } from '../context/TeamContext'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const AppliedTeams = () => {
    const { getAppliedTeams, loading } = useContext(TeamContext);
    const { userdata } = useContext(AppContext);
    const [teams, setTeams] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const t = await getAppliedTeams();
            setTeams(t);
        })();
    }, []);

    if (loading) return <div className="p-6 text-center">Loading...</div>;

    const getApplicationStatus = (team) => {
        if (!userdata) return 'Unknown';

        // Check if user is already a member
        const isMember = team.members?.some(member =>
            (typeof member === 'string' ? member : member._id) === userdata._id
        );

        if (isMember) return 'Accepted';

        // Check if user has applied
        const hasApplied = team.applicants?.some(applicant =>
            (typeof applicant.user === 'string' ? applicant.user : applicant.user._id) === userdata._id
        );

        if (hasApplied) return 'Pending';

        return 'Unknown';
    };

    return (
        <div className="p-6 max-w-4xl mx-auto pt-24">
            <h2 className="text-2xl font-semibold mb-4">Teams I've Applied To</h2>
            {teams.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No applications yet</p>
                    <button
                        onClick={() => navigate('/join-team')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Browse Teams to Join
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {teams.map(team => {
                        const status = getApplicationStatus(team);
                        return (
                            <div key={team._id} className="border p-4 rounded-lg shadow-sm bg-white">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="font-semibold text-lg text-gray-800">{team.name}</div>
                                        <div className="text-sm text-gray-600 mt-1">{team.description}</div>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                            <span>Domain: <span className="font-medium">{team.domain}</span></span>
                                            <span>Creator: <span className="font-medium">{team.creator?.name || 'Unknown'}</span></span>
                                            <span>Members: <span className="font-medium">{team.members?.length || 0}/{team.maxMembers || 2}</span></span>
                                            <span className={`font-medium ${status === 'Accepted' ? 'text-green-600' :
                                                    status === 'Pending' ? 'text-yellow-600' : 'text-gray-600'
                                                }`}>
                                                Status: {status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => navigate(`/live-opening-joining-view?teamId=${team._id}`)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                        >
                                            View Application
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
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default AppliedTeams

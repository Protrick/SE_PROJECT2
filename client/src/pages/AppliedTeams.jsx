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
    <div className="min-h-screen mt-15">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">My Applications</h1>
            <p className="mt-2 text-sm text-white">Application status updates</p>
          </div>

          <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>

              <h3 className="mt-4 text-lg font-medium text-gray-900">Check Your Email</h3>
              <p className="mt-2 text-sm text-gray-500">
                Please check the email address you provided during application for updates about your application status.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Team creators will contact you directly if there is any update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppliedTeams

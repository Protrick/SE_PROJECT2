import React, { useState, useContext, useEffect } from 'react'
import { TeamContext } from '../context/TeamContext'
import { AppContext } from '../context/AppContext'

const JoinTeam = () => {
  const { getAvailableTeams, availableTeams, applyToTeam, loading } = useContext(TeamContext);
  const { userdata } = useContext(AppContext);
  const [domain, setDomain] = useState('frontend');
  const [query, setQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [resume, setResume] = useState('');

  useEffect(() => {
    getAvailableTeams(domain, query);
  }, [domain, query]);

  const onApply = async (teamId) => {
    if (!linkedin || !github || !resume) {
      alert('Please fill in all fields (LinkedIn, GitHub, and Resume URLs)');
      return;
    }

    const success = await applyToTeam({ teamId, linkedin, github, resume });
    if (success) {
      setLinkedin('');
      setGithub('');
      setResume('');
      setSelectedTeam(null);
      // refresh list to remove applied team
      getAvailableTeams(domain);
    }
  }

  const validateUrl = (url) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pt-24">
      <h2 className="text-2xl font-semibold mb-6">Join a Team</h2>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Domain</label>
        <select
          value={domain}
          onChange={e => setDomain(e.target.value)}
          className="p-3 border rounded-lg w-64 bg-white"
        >
          <option value="frontend">Frontend Development</option>
          <option value="backend">Backend Development</option>
          <option value="devops">DevOps</option>
          <option value="ml">Machine Learning</option>
        </select>
      </div>

      {loading && <div className="text-center py-4">Loading teams...</div>}

      <div className="space-y-4">
        {!loading && availableTeams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No teams available in {domain} domain</p>
            <p className="text-sm mt-2">Try selecting a different domain or check back later</p>
          </div>
        )}

        {(userdata?._id ? availableTeams.filter(t => t.creator?._id !== userdata._id) : availableTeams).map(team => (
          <div key={team._id} className="border border-gray-200 p-6 rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{team.name}</h3>
                <p className="text-gray-600 mt-1">{team.description || 'No description provided'}</p>
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  <span>Creator: <span className="font-medium text-gray-700">{team.creator?.name || 'Unknown'}</span></span>
                  <span>Members: <span className="font-medium text-gray-700">{team.members?.length || 0}/{team.maxMembers || 2}</span></span>
                  <span>Domain: <span className="font-medium text-gray-700">{team.domain}</span></span>
                  <span className={`font-medium ${team.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    {team.isOpen ? 'Open for applications' : 'Closed'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeam(selectedTeam?._id === team._id ? null : team)}
                className={`px-4 py-2 rounded-lg font-medium ${selectedTeam?._id === team._id
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {selectedTeam?._id === team._id ? 'Cancel' : 'Apply'}
              </button>
            </div>

            {selectedTeam && selectedTeam._id === team._id && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-3 text-gray-800">Submit Your Application</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL *</label>
                    <input
                      value={linkedin}
                      onChange={e => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/your-profile"
                      className={`w-full p-3 border rounded-lg ${!linkedin || validateUrl(linkedin) ? 'border-gray-300' : 'border-red-300'}`}
                      required
                    />
                    {linkedin && !validateUrl(linkedin) && (
                      <p className="text-red-500 text-sm mt-1">Please enter a valid URL starting with http:// or https://</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile URL *</label>
                    <input
                      value={github}
                      onChange={e => setGithub(e.target.value)}
                      placeholder="https://github.com/your-username"
                      className={`w-full p-3 border rounded-lg ${!github || validateUrl(github) ? 'border-gray-300' : 'border-red-300'}`}
                      required
                    />
                    {github && !validateUrl(github) && (
                      <p className="text-red-500 text-sm mt-1">Please enter a valid URL starting with http:// or https://</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL *</label>
                    <input
                      value={resume}
                      onChange={e => setResume(e.target.value)}
                      placeholder="https://drive.google.com/your-resume or any public URL"
                      className={`w-full p-3 border rounded-lg ${!resume || validateUrl(resume) ? 'border-gray-300' : 'border-red-300'}`}
                      required
                    />
                    {resume && !validateUrl(resume) && (
                      <p className="text-red-500 text-sm mt-1">Please enter a valid URL starting with http:// or https://</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      disabled={loading || !linkedin || !github || !resume || !validateUrl(linkedin) || !validateUrl(github) || !validateUrl(resume)}
                      onClick={() => onApply(team._id)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button
                      onClick={() => setSelectedTeam(null)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default JoinTeam

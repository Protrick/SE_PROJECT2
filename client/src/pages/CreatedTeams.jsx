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
      <div className="app-bg">
        <div className="container page">
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="h1">My Created Teams</div>
              <div className="text-muted">Manage teams you have created</div>
            </div>
            <div>
              <button onClick={() => navigate('/create-team')} className="btn btn-accent">Create Team</button>
            </div>
          </div>

          {createdTeams.length === 0 ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>No teams created yet</p>
              <button onClick={() => navigate('/create-team')} className="btn btn-accent">Create Your First Team</button>
            </div>
          ) : (
            <div className="space-y-4" style={{ width: '100%' }}>
              {createdTeams.map(team => (
                <div key={team._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div className="h2" style={{ marginBottom: 6 }}>{team.name}</div>
                    <div className="text-muted" style={{ marginBottom: 8 }}>{team.description}</div>
                    <div className="text-muted" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>Domain: <strong style={{ fontWeight: 600, color: 'var(--muted)' }}>{team.domain}</strong></span>
                      <span>Members: <strong style={{ fontWeight: 600, color: 'var(--muted)' }}>{team.members?.length || 0}/{team.maxMembers || 2}</strong></span>
                      <span>Applicants: <strong style={{ fontWeight: 600, color: 'var(--muted)' }}>{team.applicants?.length || 0}</strong></span>
                      <span className={`font-medium`} style={{ color: team.isOpen ? '#4ade80' : '#fb7185' }}>{team.isOpen ? 'Open' : 'Closed'}</span>
                    </div>
                  </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button onClick={() => navigate(`/live-opening-creator-view/${team._id}`)} className="btn btn-primary">Manage Applications</button>
                    <button onClick={() => navigate(`/team/${team._id}`)} className="btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    )

}

export default CreatedTeams

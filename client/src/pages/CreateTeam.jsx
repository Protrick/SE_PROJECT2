import React, { useState, useContext } from 'react'
import { TeamContext } from '../context/TeamContext'

const CreateTeam = () => {
  const { createTeam, loading } = useContext(TeamContext);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('frontend');
  const [description, setDescription] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    await createTeam({ name, domain, description });
    setName('');
    setDescription('');
  }

  return (
    <div className="app-bg">
      <div className="container page" style={{ alignItems: 'center' }}>
        <div className="card" style={{ maxWidth: 720, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div className="h1">Create Team</div>
              <div className="text-muted">Start a new team and invite collaborators</div>
            </div>
            <div>
              <button onClick={() => { setName(''); setDescription(''); setDomain('frontend'); }} className="btn">Reset</button>
            </div>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Team name"
              className="form-input"
              required
            />
            <select value={domain} onChange={e => setDomain(e.target.value)} className="form-input">
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="devops">DevOps</option>
              <option value="ml">Machine Learning</option>
            </select>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description"
              className="form-input"
              rows={4}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setName(''); setDescription(''); setDomain('frontend'); }} className="btn">Cancel</button>
              <button disabled={loading} type="submit" className="btn btn-accent">
                {loading ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateTeam

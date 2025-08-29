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
    <div className='flex items-center justify-center min-h-screen'>
      <div className="p-6 max-w-lg mx-auto backdrop-blur-3xl">
        <h2 className="text-2xl font-semibold mb-4">Create Team</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Team name" className="w-full p-2 border rounded" required />
          <select value={domain} onChange={e => setDomain(e.target.value)} className="w-full p-2 border rounded">
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="devops">DevOps</option>
            <option value="ml">Machine Learning</option>
          </select>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" />
          <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Creating...' : 'Create'}</button>
        </form>
      </div>
    </div>
  )
}

export default CreateTeam

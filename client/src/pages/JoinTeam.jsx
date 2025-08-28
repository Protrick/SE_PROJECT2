
import React, { useState, useContext, useEffect } from "react";
import { TeamContext } from "../context/TeamContext";
import { AppContext } from "../context/AppContext";

const JoinTeam = () => {
  const { getAvailableTeams, availableTeams, applyToTeam, loading } = useContext(TeamContext);
  const { userdata } = useContext(AppContext);
  const [domain, setDomain] = useState("frontend");
  const [query, setQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [resume, setResume] = useState("");

  useEffect(() => {
    getAvailableTeams(domain, query);
  }, [domain, query]);

  const onApply = async (teamId) => {
    if (!linkedin || !github || !resume) {
      alert("Please fill in all fields (LinkedIn, GitHub, and Resume URLs)");
      return;
    }

    const success = await applyToTeam({ teamId, linkedin, github, resume });
    if (success) {
      setLinkedin("");
      setGithub("");
      setResume("");
      setSelectedTeam(null);
      getAvailableTeams(domain);
    }
  };

  const validateUrl = (url) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  return (
    <div className="app-bg">
      <div className="container page">
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="h1">Join a Team</div>
            <div className="text-muted">Browse available teams and apply</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="form-input"
              style={{ width: 220 }}
            >
              <option value="frontend">Frontend Development</option>
              <option value="backend">Backend Development</option>
              <option value="devops">DevOps</option>
              <option value="ml">Machine Learning</option>
            </select>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams..."
              className="form-input"
              style={{ width: 220 }}
            />
          </div>
        </div>

        {loading && (
          <div className="card" style={{ textAlign: "center" }}>
            <div className="text-muted">Loading teams...</div>
          </div>
        )}

        {!loading && (availableTeams || []).length === 0 && (
          <div className="card" style={{ textAlign: "center" }}>
            <div className="text-muted">No teams available in {domain} domain</div>
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-accent" onClick={() => setDomain("frontend")}>Try Frontend</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          {(userdata?._id ? (availableTeams || []).filter((t) => t.creator?._id !== userdata._id) : (availableTeams || [])).map(
            (team) => (
              <div key={team._id} className="card" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div className="h2" style={{ marginBottom: 6 }}>{team.name}</div>
                  <div className="text-muted" style={{ marginBottom: 8 }}>{team.description || "No description provided"}</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div className="text-muted">Creator: <strong style={{ color: "var(--muted)" }}>{team.creator?.name || "Unknown"}</strong></div>
                    <div className="text-muted">Members: <strong style={{ color: "var(--muted)" }}>{team.members?.length || 0}/{team.maxMembers || 2}</strong></div>
                    <div className="text-muted">Domain: <strong style={{ color: "var(--muted)" }}>{team.domain}</strong></div>
                    <div style={{ color: team.isOpen ? "#4ade80" : "#fb7185", fontWeight: 600 }}>{team.isOpen ? "Open for applications" : "Closed"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => setSelectedTeam(selectedTeam?._id === team._id ? null : team)}
                    className="btn btn-primary"
                  >
                    {selectedTeam?._id === team._id ? "Cancel" : "Apply"}
                  </button>
                  <button onClick={() => window.open(`/team/${team._id}`, "_blank")} className="btn">View</button>
                </div>
              </div>
            )
          )}
        </div>

        {selectedTeam && (
          <div className="card" style={{ marginTop: 8 }}>
            <div className="h2" style={{ marginBottom: 8 }}>Apply to {selectedTeam.name}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/your-profile"
                className="form-input"
              />
              {linkedin && !validateUrl(linkedin) && <div className="text-muted" style={{ color: "#ff726f" }}>Please enter a valid URL starting with http:// or https://</div>}

              <input
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/your-username"
                className="form-input"
              />
              {github && !validateUrl(github) && <div className="text-muted" style={{ color: "#ff726f" }}>Please enter a valid URL starting with http:// or https://</div>}

              <input
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="https://drive.google.com/your-resume or any public URL"
                className="form-input"
              />
              {resume && !validateUrl(resume) && <div className="text-muted" style={{ color: "#ff726f" }}>Please enter a valid URL starting with http:// or https://</div>}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => onApply(selectedTeam._id)}
                  disabled={loading || !linkedin || !github || !resume || !validateUrl(linkedin) || !validateUrl(github) || !validateUrl(resume)}
                  className="btn btn-accent"
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
                <button onClick={() => setSelectedTeam(null)} className="btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default JoinTeam

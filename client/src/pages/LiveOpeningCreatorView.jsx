import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TeamContext } from "../context/TeamContext";

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
  };

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  const onAccept = async (userId) => {
    const success = await acceptApplicant(teamId, userId);
    if (success) {
      fetchTeam();
      setExpandedApplicant(null);
    }
  };

  const onReject = async (userId) => {
    const success = await rejectApplicant(teamId, userId);
    if (success) {
      fetchTeam();
      setExpandedApplicant(null);
    }
  };

  const toggleApplicantDetails = (applicantId) => {
    setExpandedApplicant(expandedApplicant === applicantId ? null : applicantId);
  };

  if (loadingTeam) {
    return (
      <div className="app-bg">
        <div className="container page" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="animate-spin" style={{ width: 48, height: 48, border: "4px solid rgba(255,255,255,0.08)", borderTopColor: "white", borderRadius: 9999, margin: "0 auto" }} />
            <div className="text-muted" style={{ marginTop: 12 }}>Loading team details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="app-bg">
        <div className="container page">
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ color: "#fb7185", fontWeight: 700 }}>Team not found</div>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => navigate('/created-teams')} className="btn btn-accent">Back to My Teams</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingApplicants = team.applicants?.filter(app => app.status !== "accepted" && app.status !== "rejected") || [];
  const acceptedCount = team.members?.length || 0;
  const isTeamFull = acceptedCount >= (team.maxMembers || 2);

  return (
    <div className="app-bg">
      <div className="container page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <button onClick={() => navigate('/created-teams')} className="btn" style={{ marginBottom: 8, background: "transparent", color: "var(--muted)", padding: 0 }}>← Back to My Teams</button>
            <div className="h1">{team.name}</div>
            <div className="text-muted" style={{ marginTop: 6 }}>{team.description || 'No description provided'}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8, alignItems: "center" }}>
                <div style={{ padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Team Members</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>{acceptedCount}/{team.maxMembers || 2}</div>
                </div>
                <div style={{ padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Pending</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>{pendingApplicants.length}</div>
                </div>
                <div style={{ padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Domain</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6, textTransform: "capitalize" }}>{team.domain}</div>
                </div>
                <div style={{ padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Status</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6, color: isTeamFull ? "#fb7185" : "#4ade80" }}>{isTeamFull ? "Full" : "Open"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div className="h2">Recruitment Center</div>
              <div className="text-muted">Click on any applicant to analyze their profile and make recruitment decisions</div>
              {isTeamFull && <div style={{ marginTop: 8, color: "#f59e0b", fontWeight: 600 }}>⚠️ Your team is full. You can still review applications, but accepting new members will exceed the limit.</div>}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pendingApplicants.length === 0 ? (
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>No candidates to review</div>
                <div className="text-muted" style={{ marginTop: 6 }}>When users apply to join your team, they'll appear here for analysis</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pendingApplicants.map(applicant => (
                  <div key={applicant.user._id} className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: "linear-gradient(90deg,#60a5fa,#0369a1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>
                          {applicant.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{applicant.user.name}</div>
                          <div className="text-muted">{applicant.user.email}</div>
                          <div className="text-muted" style={{ marginTop: 6, fontSize: 13 }}>
                            Applied {new Date(applicant.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => toggleApplicantDetails(applicant.user._id)} className="btn"> {expandedApplicant === applicant.user._id ? "Hide Details" : "Analyze Profile"}</button>
                        <button disabled={loading} onClick={() => onAccept(applicant.user._id)} className="btn" style={{ background: "#16a34a", color: "white" }}>{loading ? "Recruiting..." : "✓ Recruit"}</button>
                        <button disabled={loading} onClick={() => onReject(applicant.user._id)} className="btn" style={{ background: "#ef4444", color: "white" }}>{loading ? "Processing..." : "✗ Reject"}</button>
                      </div>
                    </div>

                    {expandedApplicant === applicant.user._id && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
                          <div className="card">
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>LinkedIn Profile</div>
                            <a href={applicant.linkedin} target="_blank" rel="noopener noreferrer" className="btn" style={{ width: "100%", textAlign: "center", background: "rgba(96,165,250,0.12)" }}>View Professional Profile</a>
                            <div className="text-muted" style={{ marginTop: 6, fontSize: 13 }}>Review their professional experience, connections, and endorsements</div>
                          </div>

                          <div className="card">
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>GitHub Portfolio</div>
                            <a href={applicant.github} target="_blank" rel="noopener noreferrer" className="btn" style={{ width: "100%", textAlign: "center", background: "rgba(255,255,255,0.03)", color: "var(--muted)" }}>View Code Repository</a>
                            <div className="text-muted" style={{ marginTop: 6, fontSize: 13 }}>Analyze coding skills, project quality, and contribution history</div>
                          </div>

                          <div className="card">
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>Resume</div>
                            <a href={applicant.resume} target="_blank" rel="noopener noreferrer" className="btn" style={{ width: "100%", textAlign: "center", background: "rgba(16,185,129,0.08)", color: "var(--muted)" }}>View Full Resume</a>
                            <div className="text-muted" style={{ marginTop: 6, fontSize: 13 }}>Review education, work experience, and achievements</div>
                          </div>
                        </div>

                        <div className="card" style={{ marginTop: 12 }}>
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>Recruitment Decision</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button disabled={loading} onClick={() => onAccept(applicant.user._id)} className="btn" style={{ flex: 1, background: "#16a34a", color: "white" }}>{loading ? "Recruiting..." : "Recruit This Candidate"}</button>
                            <button disabled={loading} onClick={() => onReject(applicant.user._id)} className="btn" style={{ flex: 1, background: "#ef4444", color: "white" }}>{loading ? "Processing..." : "Decline Application"}</button>
                          </div>
                          <div className="text-muted" style={{ marginTop: 8, fontSize: 13, textAlign: "center" }}>Take your time to review all materials before making a decision</div>
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
          <div className="card" style={{ marginTop: 12 }}>
            <div className="h2">🏆 Current Team Members</div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 12 }}>
              {team.members.map(member => (
                <div key={member._id} style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, borderRadius: 10, background: "rgba(16,185,129,0.06)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "linear-gradient(90deg,#16a34a,#0369a1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>
                    {member.name?.charAt(0).toUpperCase() || "M"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{member.name}</div>
                    <div className="text-muted" style={{ marginTop: 4 }}>{member.email}</div>
                    <div style={{ marginTop: 6, display: "inline-block", padding: "4px 8px", borderRadius: 9999, background: "rgba(16,185,129,0.12)", color: "#065f46", fontSize: 12, fontWeight: 600 }}>Team Member</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveOpeningCreatorView

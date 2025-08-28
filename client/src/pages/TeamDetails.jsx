import React, { useEffect, useState, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { TeamContext } from "../context/TeamContext";
import { AppContext } from "../context/AppContext";

const TeamDetails = () => {
  const { teamId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const search = new URLSearchParams(location.search);
  const applicantIdFromQuery = search.get("applicantId");

  const { getTeamById, acceptApplicant, rejectApplicant } = useContext(TeamContext);
  const { userdata } = useContext(AppContext);

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const t = await getTeamById(teamId);
      setTeam(t);
    } catch (err) {
      setError("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  if (loading)
    return (
      <div className="app-bg page">
        <div className="container">
          <div className="card">
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="app-bg page">
        <div className="container">
          <div className="card">
            <div style={{ color: "#ff6b6b" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  if (!team)
    return (
      <div className="app-bg page">
        <div className="container">
          <div className="card">Team not found</div>
        </div>
      </div>
    );

  // find applicant subdoc for the requested applicantId (or current user)
  const applicantId = applicantIdFromQuery || userdata?._id;
  const findApplicant = (arr) => (arr || []).find((a) => String(a.user?._id || a.user) === String(applicantId));
  const pendingApplicant = findApplicant(team.applicants);
  const rejectedApplicant = findApplicant(team.rejectedApplicants);
  const isMember = (team.members || []).some((m) => String(m._id || m) === String(applicantId));

  let status = "Not applied";
  let applicant = null;
  if (isMember) {
    status = "Accepted";
  } else if (rejectedApplicant) {
    status = "Rejected";
    applicant = rejectedApplicant;
  } else if (pendingApplicant) {
    status = "Pending";
    applicant = pendingApplicant;
  }

  const isCreator = String(team.creator?._id || team.creator) === String(userdata?._id);

  const onAccept = async () => {
    if (!pendingApplicant) return;
    setActionLoading(true);
    await acceptApplicant(team._id, String(pendingApplicant.user?._id || pendingApplicant.user));
    await load();
    setActionLoading(false);
  };

  const onReject = async () => {
    if (!pendingApplicant) return;
    setActionLoading(true);
    await rejectApplicant(team._id, String(pendingApplicant.user?._id || pendingApplicant.user));
    await load();
    setActionLoading(false);
  };

  return (
    <div className="app-bg page">
      <div className="container">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <h1 className="h1" style={{ margin: 0 }}>
                {team.name}
              </h1>
              <div className="text-muted mt-2">{team.domain}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="text-muted">Members</div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>
                {(team.members || []).length}/{team.maxMembers || 2}
              </div>
            </div>
          </div>

          <p className="text-muted mt-4">{team.description}</p>

          <div style={{ display: "flex", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="card">
                <h2 className="h2">Overview</h2>
                <p className="text-muted mt-2">
                  Creator: {team.creator?.name || team.creator?.email}
                </p>
                <p className="text-muted">Domain: {team.domain}</p>
                <p className="text-muted">Openings: {team.maxMembers || 2}</p>

                <div className="mt-4">
                  <h3 className="h2">Members</h3>
                  <ul style={{ marginTop: 8, listStyle: "none", paddingLeft: 0 }}>
                    {(team.members || []).map((m) => (
                      <li key={String(m._id || m)} style={{ padding: "6px 0", borderBottom: "1px dashed rgba(255,255,255,0.04)" }}>
                        {m.name || m.email || String(m)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 320 }}>
              <div className="card">
                <h2 className="h2">Your application</h2>
                <p className="text-muted mt-2">
                  Status: <strong>{status}</strong>
                </p>

                {applicant ? (
                  <div style={{ marginTop: 10 }}>
                    <p className="text-muted">Applied At: {new Date(applicant.appliedAt || Date.now()).toLocaleString()}</p>
                    {applicant.linkedin && (
                      <p>
                        LinkedIn:{" "}
                        <a href={applicant.linkedin} target="_blank" rel="noreferrer" className="text-muted" style={{ textDecoration: "underline" }}>
                          {applicant.linkedin}
                        </a>
                      </p>
                    )}
                    {applicant.github && (
                      <p>
                        GitHub:{" "}
                        <a href={applicant.github} target="_blank" rel="noreferrer" className="text-muted" style={{ textDecoration: "underline" }}>
                          {applicant.github}
                        </a>
                      </p>
                    )}
                    {applicant.resume && (
                      <p>
                        Resume:{" "}
                        <a href={applicant.resume} target="_blank" rel="noreferrer" className="text-muted" style={{ textDecoration: "underline" }}>
                          View resume
                        </a>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted mt-3">No application found for this user on this team.</p>
                )}

                {isCreator && pendingApplicant && (
                  <div className="mt-4" style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-primary"
                      onClick={onReject}
                      disabled={actionLoading}
                      style={{ minWidth: 110 }}
                    >
                      {actionLoading ? "Processing..." : "Reject"}
                    </button>
                    <button
                      className="btn btn-accent"
                      onClick={onAccept}
                      disabled={actionLoading}
                      style={{ minWidth: 110 }}
                    >
                      {actionLoading ? "Processing..." : "Accept"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;

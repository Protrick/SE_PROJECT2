import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TeamContext } from "../context/TeamContext";
import { AppContext } from "../context/AppContext";

const AppliedTeams = () => {
  const { appliedTeams, getAppliedTeams, loading } = useContext(TeamContext);
  const { userdata } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (userdata?._id) {
      getAppliedTeams();
    }
  }, [userdata]);

  const getApplicationStatus = (team, userId) => {
    if (!team || !userId) return "Unknown";

    const isMember = (team.members || []).some(
      (m) => String(m._id || m) === String(userId)
    );
    if (isMember) return "Accepted";

    const isRejected = (team.rejectedApplicants || []).some(
      (a) => String(a.user?._id || a.user) === String(userId)
    );
    if (isRejected) return "Rejected";

    const isPending = (team.applicants || []).some(
      (a) => String(a.user?._id || a.user) === String(userId)
    );
    if (isPending) return "Pending";

    return "Unknown";
  };

  const statusColor = (status) => {
    switch (status) {
      case "Accepted":
        return { background: "#16a34a", color: "white" };
      case "Rejected":
        return { background: "#ef4444", color: "white" };
      case "Pending":
        return { background: "#f59e0b", color: "black" };
      default:
        return { background: "#6b7280", color: "white" };
    }
  };

  if (loading) {
    return (
      <div className="app-bg">
        <div className="container page" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="animate-spin" style={{ width: 48, height: 48, border: "4px solid rgba(255,255,255,0.08)", borderTopColor: "white", borderRadius: 9999, margin: "0 auto" }} />
            <div className="text-muted" style={{ marginTop: 12 }}>Loading your applications...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg">
      <div className="container page">
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="h1">My Applications</div>
            <div className="text-muted">Application status updates</div>
          </div>
        </div>

        {appliedTeams?.length === 0 ? (
          <div className="card" style={{ textAlign: "center" }}>
            <div className="text-muted" style={{ marginBottom: 12 }}>You haven't applied to any teams yet.</div>
            <div>
              <button className="btn btn-accent" onClick={() => navigate("/join-team")}>Find Teams to Join</button>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            {appliedTeams.map((team) => {
              const status = getApplicationStatus(team, userdata?._id);
              const sc = statusColor(status);
              return (
                <div key={team._id} className="card" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div className="h2" style={{ marginBottom: 6 }}>{team.name}</div>
                    <div className="text-muted" style={{ marginBottom: 8 }}>{team.description}</div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <div className="text-muted">Creator: <strong style={{ color: "var(--muted)" }}>{team.creator?.name || team.creator}</strong></div>
                      <div className="text-muted">Domain: <strong style={{ color: "var(--muted)" }}>{team.domain}</strong></div>
                      <div style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 9999, fontWeight: 600, fontSize: 13, background: sc.background, color: sc.color }}>
                        {status}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => navigate(`/team/${team._id}`)}>View Team</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default AppliedTeams;

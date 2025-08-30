import axios from "axios";
import { createContext, useContext, useState } from "react";
import { AppContext } from "./AppContext";

export const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
    const { backendUrl, userdata } = useContext(AppContext);

    const [createdTeams, setCreatedTeams] = useState([]);
    const [availableTeams, setAvailableTeams] = useState([]);
    const [loading, setLoading] = useState(false);

    const isValidUrl = (u) => {
        try {
            const x = new URL(u);
            return x.protocol === "http:" || x.protocol === "https:";
        } catch {
            return false;
        }
    };

    // Create team
    const createTeam = async ({ name, domain, description }) => {
        try {
            setLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/team`,
                { name, domain, description },
                { withCredentials: true }
            );
            if (data?.success && data.team) {
                setCreatedTeams((prev) => [data.team, ...prev]);
                return { success: true, team: data.team };
            }
            return { success: false, message: data?.message || "Create failed" };
        } catch (err) {
            console.error("createTeam error:", err);
            return {
                success: false,
                message: err?.response?.data?.message || err.message || "Server error",
            };
        } finally {
            setLoading(false);
        }
    };

    // Fetch teams I created
    const getCreatedTeams = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/team/created`, {
                withCredentials: true,
            });
            if (data?.success) setCreatedTeams(data.teams || []);
        } catch (err) {
            console.error("getCreatedTeams error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch available teams for a domain (exclude my teams)
    const getAvailableTeams = async (domain) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/team/available`, {
                params: { domain },
                withCredentials: true,
            });
            if (data?.success) {
                const teams = data.teams || [];
                const myId = userdata?._id ? String(userdata._id) : null;
                const filtered = myId
                    ? teams.filter(
                        (t) => String(t.creator?._id || t.creator) !== myId
                    )
                    : teams;
                setAvailableTeams(filtered);
            }
        } catch (err) {
            console.error("getAvailableTeams error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Apply to a team
    const applyToTeam = async ({ teamId, linkedin, github, resume }) => {
        try {
            if (!teamId) throw new Error("teamId required");
            if (!linkedin || !github || !resume)
                throw new Error("All links are required");
            if (![linkedin, github, resume].every(isValidUrl))
                throw new Error("Invalid URL(s)");
            setLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/team/${teamId}/apply`,
                { linkedin, github, resume },
                { withCredentials: true }
            );
            if (data?.success) return { success: true };
            return { success: false, message: data?.message || "Apply failed" };
        } catch (err) {
            console.error("applyToTeam error:", err);
            console.error("Error response data:", err?.response?.data);
            console.error("Error status:", err?.response?.status);
            return {
                success: false,
                message: err?.response?.data?.message || err.message || "Server error",
            };
        } finally {
            setLoading(false);
        }
    };

    // Get one team by id
    const getTeamById = async (teamId) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/team/${teamId}`, {
                withCredentials: true,
            });
            if (data?.success) return data.team;
            return null;
        } catch (err) {
            console.error("getTeamById error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Creator actions
    const acceptApplicant = async (teamId, applicantId) => {
        try {
            if (!teamId || !applicantId)
                throw new Error("teamId and applicantId required");
            setLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/team/${teamId}/applicants/${applicantId}/accept`,
                {},
                { withCredentials: true }
            );
            return !!data?.success;
        } catch (err) {
            console.error("acceptApplicant error:", err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const rejectApplicant = async (teamId, applicantId) => {
        try {
            if (!teamId || !applicantId)
                throw new Error("teamId and applicantId required");
            setLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/team/${teamId}/applicants/${applicantId}/reject`,
                {},
                { withCredentials: true }
            );
            return !!data?.success;
        } catch (err) {
            console.error("rejectApplicant error:", err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const withdrawApplication = async (teamId, applicantId) => {
        try {
            if (!teamId || !applicantId)
                throw new Error("teamId and applicantId required");
            setLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/team/${teamId}/applicants/${applicantId}/withdraw`,
                {},
                { withCredentials: true }
            );
            return !!data?.success;
        } catch (err) {
            console.error("withdrawApplication error:", err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Get teams where user has applied/is member
    const getAppliedTeams = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/team/applied`, {
                withCredentials: true,
            });
            if (data?.success) {
                return data.teams || [];
            }
            return [];
        } catch (err) {
            console.error("getAppliedTeams error:", err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return (
        <TeamContext.Provider
            value={{
                loading,
                createdTeams,
                availableTeams,
                createTeam,
                getCreatedTeams,
                getAvailableTeams,
                getAppliedTeams,
                applyToTeam,
                getTeamById,
                acceptApplicant,
                rejectApplicant,
                withdrawApplication,
            }}
        >
            {children}
        </TeamContext.Provider>
    );
};

export const TeamContextProvider = TeamProvider;
export default TeamProvider;

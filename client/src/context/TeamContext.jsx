import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from './AppContext';

export const TeamContext = createContext();

export const TeamContextProvider = ({ children }) => {
    const { backendUrl, userdata } = useContext(AppContext);
    const [createdTeams, setCreatedTeams] = useState([]);
    const [availableTeams, setAvailableTeams] = useState([]);
    const [loading, setLoading] = useState(false);

    const createTeam = async ({ name, domain, description }) => {
        try {
            setLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/team`,
                { name, domain, description },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success('Team created');
                // update createdTeams
                setCreatedTeams((s) => [data.team, ...s]);
                return data.team;
            }
            toast.error(data.message || 'Failed to create team');
            return null;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Create team error');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getCreatedTeams = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/team/created`, { withCredentials: true });
            if (data.success) {
                setCreatedTeams(data.teams || []);
            } else {
                toast.error(data.message || 'Failed to load created teams');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Error loading created teams');
        } finally {
            setLoading(false);
        }
    };

    const getAvailableTeams = async (domain) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/team/available`, {
                params: { domain },
                withCredentials: true,
            });
            if (data.success) {
                setAvailableTeams(data.teams || []);
            } else {
                toast.error(data.message || 'Failed to load available teams');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Error loading available teams');
        } finally {
            setLoading(false);
        }
    };

    const applyToTeam = async ({ teamId, linkedin, github, resume }) => {
        try {
            setLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/team/${teamId}/apply`,
                { linkedin, github, resume },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message || 'Applied successfully');
                return true;
            }
            toast.error(data.message || 'Apply failed');
            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Error applying to team');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getTeamById = async (teamId) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/team/${teamId}`, { withCredentials: true });
            if (data.success) return data.team;
            toast.error(data.message || 'Failed to load team');
            return null;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Error loading team');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const acceptApplicant = async (teamId, applicantId) => {
        try {
            setLoading(true);
            const { data } = await axios.post(`${backendUrl}/api/team/${teamId}/applicants/${applicantId}/accept`, {}, { withCredentials: true });
            if (data.success) {
                toast.success(data.message || 'Applicant accepted');
                return true;
            }
            toast.error(data.message || 'Accept failed');
            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Error accepting applicant');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const rejectApplicant = async (teamId, applicantId) => {
        try {
            setLoading(true);
            const { data } = await axios.post(`${backendUrl}/api/team/${teamId}/applicants/${applicantId}/reject`, {}, { withCredentials: true });
            if (data.success) {
                toast.success(data.message || 'Applicant rejected');
                return true;
            }
            toast.error(data.message || 'Reject failed');
            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Error rejecting applicant');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const withdrawApplication = async (teamId) => {
        try {
            setLoading(true);
            const { data } = await axios.post(`${backendUrl}/api/team/${teamId}/withdraw`, {}, { withCredentials: true });
            if (data.success) {
                toast.success(data.message || 'Application withdrawn');
                return true;
            }
            toast.error(data.message || 'Withdraw failed');
            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Error withdrawing application');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getAppliedTeams = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/team/applied`, { withCredentials: true });
            if (data.success) return data.teams || [];
            toast.error(data.message || 'Failed to load applied teams');
            return [];
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Error loading applied teams');
            return [];
        } finally {
            setLoading(false);
        }
    };

    const value = {
        createdTeams,
        availableTeams,
        loading,
        createTeam,
        getCreatedTeams,
        getAvailableTeams,
        applyToTeam,
        getTeamById,
        acceptApplicant,
        rejectApplicant,
        withdrawApplication,
        getAppliedTeams,
    };

    return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

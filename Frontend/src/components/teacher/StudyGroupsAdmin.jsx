import { useState, useEffect } from "react";
import { useAuth } from '@/lib/AuthContext';
import { fetchStudyGroups, createStudyGroup, updateStudyGroup, deleteStudyGroup } from '@/api';
import ResourceTable from "../teachersdashboard/ResourceTable";
import ResourceForm from "../teachersdashboard/ResourceForm";

const FIELDS = [
  { key: "name", label: "Group Name", required: true },
  { key: "subject", label: "Subject", required: true },
  { key: "level", label: "Level", type: "select", required: true, options: [
    { value: "PSLC", label: "PSLC" }, { value: "JCE", label: "JCE" }, { value: "MSCE", label: "MSCE" }
  ]},
  { key: "description", label: "Description", type: "textarea" },
  { key: "mentor_email", label: "Mentor Email" },
  { key: "scheduled_at", label: "Scheduled Date/Time" },
];

/**
 * @param {any} value
 * @returns {number}
 */
const renderMemberCount = (value) => Array.isArray(value) ? value.length : 0;

const COLUMNS = [
  { key: "name", label: "Group Name" },
  { key: "subject", label: "Subject" },
  { key: "level", label: "Level" },
  { key: "scheduled_at", label: "Scheduled" },
  { key: "members", label: "Members", render: renderMemberCount },
];

export default function StudyGroupsAdmin() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(/** @type {{ mode: 'add' | 'edit'; data: any } | null } */ (null));

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchStudyGroups();
      setItems(Array.isArray(data) ? data : data?.data ?? []);
    } catch (error) {
      console.error(error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /**
   * @param {any} data
   */
  const handleSave = async (data) => {
    const prepared = {
      ...data,
      mentor_email: data.mentor_email?.trim() || user?.email,
      mentor_name: data.mentor_name?.trim() || user?.full_name || user?.email?.split('@')[0],
    };

    if (form?.mode === "edit") {
      await updateStudyGroup(form.data.id, prepared);
    } else {
      await createStudyGroup(prepared);
    }

    setForm(null);
    load();
  };

  /**
   * @param {string} id
   */
  const handleDelete = async (id) => {
    if (!confirm("Delete this study group?")) return;
    await deleteStudyGroup(id);
    load();
  };

  return (
    <>
      <ResourceTable title="Study Groups" items={items} columns={COLUMNS} loading={loading} />
    </>
  );
}

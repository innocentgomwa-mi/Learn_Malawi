import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, Lock, Globe, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fetchStudyGroups, updateStudyGroup } from "@/api";
import { useAuth } from "@/lib/AuthContext";

const FALLBACK_GROUPS = [
  {
    name: "MSCE Mathematics",
    subject: "Mathematics",
    members: 34,
    type: "public",
    description: "Tackle past paper questions together and share solving techniques.",
    activity: "Active now",
    avatars: ["JM", "TC", "NB", "AP"],
  },
  {
    name: "Biology Study Circle",
    subject: "Biology",
    members: 22,
    type: "public",
    description: "Diagrams, definitions, and exam prep for MSCE Biology.",
    activity: "2h ago",
    avatars: ["LK", "SM", "RN"],
  },
  {
    name: "Physics & Chemistry",
    subject: "Sciences",
    members: 18,
    type: "private",
    description: "Advanced group for science students focusing on calculations.",
    activity: "1h ago",
    avatars: ["DM", "FC", "TW", "EA"],
  },
  {
    name: "English Language Arts",
    subject: "English",
    members: 41,
    type: "public",
    description: "Essay writing, comprehension, and composition tips.",
    activity: "30m ago",
    avatars: ["PK", "MN", "BL"],
  },
];

export default function StudyGroupsSection() {
  const [groups, setGroups] = useState(FALLBACK_GROUPS);
  const [loadingJoinIds, setLoadingJoinIds] = useState({});
  const navigate = useNavigate();
  const { isAuthenticated, navigateToLogin, user } = useAuth();

  const getMemberCount = (group) =>
    Array.isArray(group.members) ? group.members.length : group.members || group.size || 0;

  const openStudyGroup = (group) => {
    const groupId = group.id || group._id;
    const query = groupId ? `?groupId=${encodeURIComponent(groupId)}` : "";
    navigate(`/study-groups${query}`);
  };

  const joinStudyGroup = async (group, event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      return navigateToLogin?.();
    }

    const email = user?.email;
    if (!email || !group.id) {
      return openStudyGroup(group);
    }

    const members = Array.isArray(group.members) ? group.members : [];
    if (members.includes(email)) {
      return openStudyGroup(group);
    }

    setLoadingJoinIds((prev) => ({ ...prev, [group.id]: true }));
    try {
      const updated = await updateStudyGroup(group.id, {
        members: [...members, email],
      });
      setGroups((prev) => prev.map((item) => (item.id === group.id ? { ...item, ...updated } : item)));
      openStudyGroup(updated);
    } catch {
      openStudyGroup(group);
    } finally {
      setLoadingJoinIds((prev) => {
        const next = { ...prev };
        delete next[group.id];
        return next;
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    fetchStudyGroups({ limit: 4 })
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;

        setGroups(
          data.map((group) => ({
            ...group,
            name: group.name || group.title || "Study Group",
            subject: group.subject || group.topic || "General",
            type: group.is_public || group.visibility === "public" ? "public" : "private",
            description:
              group.description || group.summary || "Collaborate with peers and stay on track.",
            activity: group.activity || group.last_active || "Active now",
            avatars: Array.isArray(group.members)
              ? Array.from({ length: Math.min(3, group.members.length) }, (_, index) => `U${index + 1}`)
              : ["A1", "B2", "C3"],
          }))
        );
      })
      .catch(() => {
        if (!mounted) return;
        setGroups(FALLBACK_GROUPS);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="rounded-[28px] border border-blue-800/50 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-white">Study Groups</h2>
          <p className="text-sm text-blue-100/80">Learn better together</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/study-groups")}
          className="inline-flex items-center gap-1 rounded-full border border-yellow-300 bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-blue-950 transition-all hover:gap-2 hover:bg-yellow-300"
        >
          All groups <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groups.map((group) => {
          const joined = isAuthenticated && Array.isArray(group.members) && group.members.includes(user?.email);
          return (
            <div
              key={group.id || group.name}
              onClick={() => openStudyGroup(group)}
              className="rounded-xl border border-yellow-500/50 bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:from-yellow-300 hover:to-yellow-100 transition-all duration-200 flex flex-col gap-3 cursor-pointer"
            >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-900/15 border border-blue-800/30 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-blue-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm font-heading text-blue-950">{group.name}</h3>
                  <p className="text-xs text-blue-900/80">{group.subject}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] flex items-center gap-1 px-1.5 py-0 border-blue-800/30 bg-blue-900/10 text-blue-900"
              >
                {group.type === "public"
                  ? <><Globe className="h-2.5 w-2.5" /> Public</>
                  : <><Lock className="h-2.5 w-2.5" /> Private</>
                }
              </Badge>
            </div>

            <p className="text-xs text-blue-900/80 leading-relaxed">{group.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {group.avatars.slice(0, 3).map((a, i) => (
                    <Avatar key={i} className="h-6 w-6 border-2 border-yellow-300">
                      <AvatarFallback className="text-[9px] bg-blue-900/10 text-blue-900 font-medium">{a}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-blue-900/80">{getMemberCount(group)} members</span>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={(e) => joinStudyGroup(group, e)}
                className="h-7 text-xs gap-1 rounded-full border border-yellow-500 bg-yellow-400 text-blue-950 font-semibold hover:bg-yellow-300 shadow-sm"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {loadingJoinIds[group.id] ? "Joining..." : joined ? "Open" : "Join"}
              </Button>
            </div>
          </div>
        );
      })}
      </div>
    </section>
  );
}
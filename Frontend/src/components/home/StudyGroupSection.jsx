import React, { useEffect, useState } from "react";
import { Users, ArrowRight, Lock, Globe, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fetchStudyGroups } from "@/api";

const FALLBACK_GROUPS = [
  {
    name: "MSCE Mathematics",
    subject: "Mathematics",
    members: 34,
    type: "public",
    description: "Tackle past paper questions together and share solving techniques.",
    activity: "Active now",
    avatars: ["JM", "TC", "NB", "AP"],
    color: "bg-blue-500",
  },
  {
    name: "Biology Study Circle",
    subject: "Biology",
    members: 22,
    type: "public",
    description: "Diagrams, definitions, and exam prep for MSCE Biology.",
    activity: "2h ago",
    avatars: ["LK", "SM", "RN"],
    color: "bg-green-500",
  },
  {
    name: "Physics & Chemistry",
    subject: "Sciences",
    members: 18,
    type: "private",
    description: "Advanced group for science students focusing on calculations.",
    activity: "1h ago",
    avatars: ["DM", "FC", "TW", "EA"],
    color: "bg-purple-500",
  },
  {
    name: "English Language Arts",
    subject: "English",
    members: 41,
    type: "public",
    description: "Essay writing, comprehension, and composition tips.",
    activity: "30m ago",
    avatars: ["PK", "MN", "BL"],
    color: "bg-orange-500",
  },
];

export default function StudyGroupsSection() {
  const [groups, setGroups] = useState(FALLBACK_GROUPS);

  useEffect(() => {
    let mounted = true;

    fetchStudyGroups({ limit: 4 })
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;

        setGroups(
          data.map((group) => ({
            name: group.name || group.title || "Study Group",
            subject: group.subject || group.topic || "General",
            members: group.members || group.size || 0,
            type: group.is_public || group.visibility === "public" ? "public" : "private",
            description:
              group.description || group.summary || "Collaborate with peers and stay on track.",
            activity: group.activity || group.last_active || "Active now",
            avatars: group.members
              ? Array.from({ length: Math.min(3, group.members) }, (_, index) => `U${index + 1}`)
              : ["A1", "B2", "C3"],
            color: "bg-blue-500",
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
    <section className="rounded-[28px] border border-slate-200/80 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-heading font-bold">Study Groups</h2>
          <p className="text-sm text-muted-foreground">Learn better together</p>
        </div>
        <button className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
          All groups <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div
            key={group.name}
            className="bg-card rounded-xl border p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg ${group.color} flex items-center justify-center shrink-0`}>
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm font-heading">{group.name}</h3>
                  <p className="text-xs text-muted-foreground">{group.subject}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] flex items-center gap-1 px-1.5 py-0">
                {group.type === "public"
                  ? <><Globe className="h-2.5 w-2.5" /> Public</>
                  : <><Lock className="h-2.5 w-2.5" /> Private</>
                }
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{group.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {group.avatars.slice(0, 3).map((a, i) => (
                    <Avatar key={i} className="h-6 w-6 border-2 border-card">
                      <AvatarFallback className="text-[9px] bg-muted font-medium">{a}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{group.members} members</span>
              </div>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-primary hover:bg-primary/10 gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                Join
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
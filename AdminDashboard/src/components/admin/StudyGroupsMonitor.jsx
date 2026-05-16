import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users, BookOpen, CalendarDays, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { apiClient } from "@/api/apiClient";

const LEVEL_OPTIONS = ["PSLC", "JCE", "MSCE"];

export default function StudyGroupsMonitor({ refreshSeconds }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const {
    data: groups = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["study-groups"],
    queryFn: () => apiClient.entities.StudyGroup.list(),
    refetchInterval: refreshSeconds > 0 ? refreshSeconds * 1000 : false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.entities.StudyGroup.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["study-groups"] }),
  });

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return groups
      .slice()
      .sort((a, b) => new Date(b.createdDate || b.created_date).getTime() - new Date(a.createdDate || a.created_date).getTime())
      .filter((group) => {
        const matchesLevel = levelFilter === "all" || group.level === levelFilter;
        const text = [group.name, group.subject, group.mentor_email, group.mentor_name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesSearch = !normalizedSearch || text.includes(normalizedSearch);
        return matchesLevel && matchesSearch;
      });
  }, [groups, search, levelFilter]);

  const totalMembers = useMemo(
    () => groups.reduce((sum, group) => sum + (Array.isArray(group.members) ? group.members.length : 0), 0),
    [groups]
  );

  const groupsWithMentor = useMemo(
    () => groups.filter((group) => group.mentor_email || group.mentor_name).length,
    [groups]
  );

  const recentlyCreated = useMemo(
    () => groups
      .slice()
      .sort((a, b) => new Date(b.createdDate || b.created_date).getTime() - new Date(a.createdDate || a.created_date).getTime())
      .slice(0, 3),
    [groups]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Study Group Monitoring</h2>
          <p className="text-sm text-gray-500 mt-1">Review and track all study groups created by users.</p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto md:grid-cols-[minmax(0,16rem)_minmax(0,12rem)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groups, subject, or mentor"
              className="pl-10"
            />
          </div>
          <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {LEVEL_OPTIONS.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Users className="h-5 w-5" />
              <p className="text-xs uppercase tracking-wider">Total groups</p>
            </div>
            <p className="text-3xl font-semibold text-slate-900">{groups.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <BookOpen className="h-5 w-5" />
              <p className="text-xs uppercase tracking-wider">Total members</p>
            </div>
            <p className="text-3xl font-semibold text-slate-900">{totalMembers}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <CalendarDays className="h-5 w-5" />
              <p className="text-xs uppercase tracking-wider">Mentor assigned</p>
            </div>
            <p className="text-3xl font-semibold text-slate-900">{groupsWithMentor}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Users className="h-5 w-5" />
              <p className="text-xs uppercase tracking-wider">Recent groups</p>
            </div>
            <p className="text-3xl font-semibold text-slate-900">{recentlyCreated.length}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">Loading study groups...</div>
      ) : isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700">Unable to load study groups. Please try again later.</div>
      ) : filteredGroups.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
          <p className="text-lg font-semibold text-slate-900">No study groups found</p>
          <p className="mt-2 text-sm">Try adjusting the search or filters to find study groups.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-900">{group.name}</span>
                      <span className="text-xs text-slate-500">{group.description || "No description"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{group.subject || "—"}</TableCell>
                  <TableCell>{group.level || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-slate-900">{group.mentor_name || "Unknown"}</span>
                      {group.mentor_email && <span className="text-xs text-slate-500">{group.mentor_email}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{Array.isArray(group.members) ? group.members.length : 0}</Badge>
                    {Array.isArray(group.banned_members) && group.banned_members.length > 0 && (
                      <Badge variant="destructive" className="ml-2">{group.banned_members.length} banned</Badge>
                    )}
                  </TableCell>
                  <TableCell>{group.createdDate ? new Date(group.createdDate).toLocaleDateString() : group.created_date ? new Date(group.created_date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="min-w-[5.5rem]"
                      onClick={() => deleteMutation.mutate(group.id)}
                      disabled={deleteMutation.isLoading}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

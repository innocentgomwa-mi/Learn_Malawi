import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import StudyBlockCard from "./StudyBlockCard";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WeeklyTimetable({ blocks = [], resources = [], onAddBlock, onEditBlock, onDeleteBlock }) {
  const groupedBlocks = DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {});

  blocks.forEach((block) => {
    const day = DAYS.includes(block.day_of_week) ? block.day_of_week : "Monday";
    groupedBlocks[day].push(block);
  });

  DAYS.forEach((day) => {
    groupedBlocks[day].sort((a, b) => {
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      return a.start_time.localeCompare(b.start_time);
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-semibold">Weekly Timetable</h2>
          <p className="text-sm text-muted-foreground">Review your planned study blocks for the week.</p>
        </div>
        <Button size="sm" onClick={() => onAddBlock("Monday")}>Add block</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {DAYS.map((day) => (
          <section key={day} className="rounded-3xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{day}</p>
                <p className="text-xs text-muted-foreground">{groupedBlocks[day].length} blocks</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onAddBlock(day)}>Add</Button>
            </div>

            <ScrollArea className="max-h-[520px] pr-2">
              {groupedBlocks[day].length === 0 ? (
                <p className="text-xs text-muted-foreground">No blocks scheduled yet.</p>
              ) : (
                <div className="space-y-3">
                  {groupedBlocks[day].map((block) => (
                    <StudyBlockCard
                      key={block.id}
                      block={block}
                      resources={resources}
                      onEdit={onEditBlock}
                      onDelete={onDeleteBlock}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </section>
        ))}
      </div>
    </div>
  );
}

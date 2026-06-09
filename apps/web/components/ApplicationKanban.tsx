"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COLUMNS = [
  { id: "SAVED", title: "Сохранено", color: "border-t-gray-400" },
  { id: "PREPARING", title: "Готовлюсь", color: "border-t-blue-400" },
  { id: "APPLIED", title: "Подался", color: "border-t-indigo-400" },
  { id: "WAITING", title: "Жду ответ", color: "border-t-amber-400" },
  { id: "INTERVIEW", title: "Интервью", color: "border-t-purple-400" },
  { id: "OFFER", title: "Оффер", color: "border-t-green-400" },
  { id: "REJECTED", title: "Отказ", color: "border-t-red-400" },
];

interface Application {
  id: string;
  status: string;
  opportunity: { title: string; company: { name: string }; deadline?: string };
  appliedAt?: string;
  nextStep?: string;
}

export function ApplicationKanban() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => { fetchApplications(); }, []);

  async function fetchApplications() {
    try {
      const res = await api.get("/api/v1/applications");
      setApplications(res.data.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const appId = active.id as string;
    const newStatus = over.id as string;
    const app = applications.find((a) => a.id === appId);
    if (!app || app.status === newStatus) return;

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );

    try {
      await api.patch(`/api/v1/applications/${appId}/status`, {
        status: newStatus,
        note: `Changed from ${app.status} to ${newStatus}`,
      });
    } catch {
      // Rollback
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: app.status } : a))
      );
    }
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="min-w-[280px] flex-1">
            <div className="mb-3 h-6 w-24 animate-pulse rounded bg-gray-200" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const grouped = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = applications.filter((a) => a.status === col.id);
      return acc;
    },
    {} as Record<string, Application[]>
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event: DragStartEvent) => setActiveId(event.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="min-w-[280px] flex-1">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">{col.title}</h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {grouped[col.id]?.length ?? 0}
              </span>
            </div>

            <SortableContext
              items={grouped[col.id]?.map((a) => a.id) ?? []}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {grouped[col.id]?.map((app) => (
                  <SortableApplicationCard key={app.id} application={app} />
                ))}
              </div>
            </SortableContext>

            {(!grouped[col.id] || grouped[col.id].length === 0) && (
              <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-gray-300">
                <p className="text-xs text-gray-400">Перетащите сюда</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <ApplicationCard
            application={applications.find((a) => a.id === activeId)!}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableApplicationCard({ application }: { application: Application }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ApplicationCard application={application} />
    </div>
  );
}

function ApplicationCard({ application, isDragOverlay }: { application: Application; isDragOverlay?: boolean }) {
  const daysSinceApplied = application.appliedAt
    ? Math.ceil(
        (Date.now() - new Date(application.appliedAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <Card className={`p-4 ${isDragOverlay ? "shadow-lg rotate-2" : ""}`}>
      <h4 className="font-medium text-gray-900 text-sm">{application.opportunity.title}</h4>
      <p className="mt-0.5 text-xs text-gray-500">{application.opportunity.company.name}</p>

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        {daysSinceApplied !== null && (
          <span>{daysSinceApplied === 0 ? "Сегодня" : `${daysSinceApplied} дн. назад`}</span>
        )}
        {application.opportunity.deadline && (
          <Badge variant={new Date(application.opportunity.deadline) < new Date() ? "error" : "warning"}>
            Дедлайн
          </Badge>
        )}
      </div>

      {application.nextStep && (
        <p className="mt-2 text-xs text-gray-500 truncate">→ {application.nextStep}</p>
      )}
    </Card>
  );
}

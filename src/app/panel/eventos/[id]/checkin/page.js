"use client";
import { useParams } from "next/navigation";
import { EventAttendance } from "@/components/event-forms-admin/attendance";
export default function EventAttendancePage() {
  const { id } = useParams();
  return <EventAttendance id={id} taking />;
}

"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const tasks = useQuery(api.tasks.get);
  console.log(tasks);
  return <div className="text-red-400">
    <Button>asdasd</Button>
    {tasks?.map((task) => (
      <div key={task._id}>{task.text}--{`${task.isCompleted}`}</div>
    ))}
  </div>;
}
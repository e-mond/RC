import React, { useEffect, useState } from "react";
import { fetchArtisanTasks, updateTaskStatus } from "@/services/artisanService";

export default function AR_AssignedTasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchArtisanTasks();
        setTasks(res.tasks || []);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const complete = async (id) => {
    try {
      await updateTaskStatus(id, "completed");
      setTasks(t => t.map(ts => ts.id === id ? {...ts, status: "completed"} : ts));
    } catch (err) { console.error(err); alert("Could not update task"); }
  };

  return (
    <section className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Assigned Tasks</h3>
      {tasks.map(t => (
        <div key={t.id} className="flex items-center justify-between gap-4 border p-2 rounded mb-2">
          <div>
            <div className="font-medium">{t.title}</div>
            <div className="text-xs text-gray-500">{t.address}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${t.status === "completed" ? "text-green-600" : "text-yellow-600"}`}>{t.status}</span>
            {t.status !== "completed" && <button onClick={() => complete(t.id)} className="px-3 py-1 bg-[#0b6e4f] text-white rounded">Complete</button>}
          </div>
        </div>
      ))}
    </section>
  );
}

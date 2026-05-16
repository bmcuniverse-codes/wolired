import { useEffect, useState } from 'react'; import api from '../services/api';
export default function Reports(){const [logs,setLogs]=useState([]),[subs,setSubs]=useState([]); useEffect(()=>{api.get('/monitoring/logs').then(r=>setLogs(r.data)); api.get('/exams/reports/all').then(r=>setSubs(r.data))},[]); return <main className="mx-auto max-w-7xl p-6"><h1 className="mb-6 text-3xl font-black">Reports & Malpractice Logs</h1><section className="card mb-6 overflow-x-auto"><h2 className="mb-4 text-xl font-bold">Submissions</h2>

<div className="w-full overflow-x-auto">
<table className="w-full text-left text-sm"><thead className="text-cyan-300"><tr><th>Student</th><th>Exam</th><th>Submitted</th></tr></thead><tbody>{subs.map(s=><tr className="border-t border-white/10" key={s._id}><td className="py-3">{s.student?.name}</td><td>{s.exam?.title}</td><td>{new Date(s.submittedAt).toLocaleString()}</td></tr>)}</tbody></table>
</div>

</section><section className="card overflow-x-auto"><h2 className="mb-4 text-xl font-bold">Malpractice Alerts</h2>

<div className="w-full overflow-x-auto">
<table className="w-full text-left text-sm"><thead className="text-cyan-300"><tr><th>Student</th><th>Exam</th><th>Type</th><th>Message</th><th>Time</th></tr></thead><tbody>{logs.map(l=><tr className="border-t border-white/10" key={l._id}><td className="py-3">{l.student?.name}</td><td>{l.exam?.title}</td><td><span className="badge bg-red-500/20 text-red-200">{l.type}</span></td><td>{l.message}</td><td>{new Date(l.timestamp).toLocaleString()}</td></tr>)}</tbody></table>
</div>

</section></main>}

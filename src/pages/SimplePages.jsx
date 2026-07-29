import React,{useEffect,useState}from"react";import{Link,useSearchParams,useNavigate}from"react-router-dom";import Header from"../components/Header";import{api,getUser}from"../api";

export function Doctors(){
  const[doctors,setDoctors]=useState([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(null);
  useEffect(()=>{api.getDoctors().then(res=>setDoctors(res.doctors||[])).catch(err=>setError(err.message)).finally(()=>setLoading(false))},[]);
  return <><Header/><main className="dashboard-main"><div className="dashboard-card">
    <p className="tagline">MediBook</p>
    <h1>Doctors Page</h1>
    <p>Browse registered doctors and book an appointment.</p>
    {loading&&<p>Loading doctors...</p>}
    {error&&<div className="form-message error" style={{display:"block"}}>{error}</div>}
    {!loading&&!error&&doctors.length===0&&<p>No doctors have registered yet.</p>}
    <div className="dashboard-grid">
      {doctors.map(doc=>
        <div className="stat-card" key={doc._id}>
          <h3>{doc.specialty||"General Physician"}</h3>
          <p>{doc.email}</p>
          <p>{doc.mobile}</p>
          <Link className="login-btn" style={{display:"inline-block",marginTop:"10px",textDecoration:"none",textAlign:"center"}} to={`/booking?doctorId=${doc._id}`}>Book Appointment</Link>
        </div>
      )}
    </div>
  </div></main></>
}

export function Booking(){
  const[params]=useSearchParams();
  const nav=useNavigate();
  const doctorId=params.get("doctorId")||"";
  const[doctors,setDoctors]=useState([]);
  const[msg,setMsg]=useState(null);
  const[loading,setLoading]=useState(false);
  const user=getUser();

  useEffect(()=>{api.getDoctors().then(res=>setDoctors(res.doctors||[])).catch(()=>{})},[]);

  const submit=async e=>{
    e.preventDefault();
    if(!user){setMsg(["Please login as a patient to book an appointment.","error"]);setTimeout(()=>nav("/login"),900);return}
    if(user.role!=="patient"){setMsg(["Only patients can book appointments.","error"]);return}
    const d=new FormData(e.currentTarget);
    const payload={doctorId:d.get("doctorId"),date:d.get("date"),time:d.get("time"),reason:d.get("reason")};
    if(!payload.doctorId||!payload.date||!payload.time){setMsg(["Please choose a doctor, date, and time.","error"]);return}
    setLoading(true);
    try{
      const res=await api.bookAppointment(payload);
      setMsg([res.message||"Appointment booked successfully!","success"]);
      e.currentTarget.reset();
      setTimeout(()=>nav("/patient-dashboard"),900);
    }catch(err){setMsg([err.message||"Failed to book appointment.","error"])}
    finally{setLoading(false)}
  };

  return <><Header/><main className="dashboard-main"><div className="dashboard-card">
    <p className="tagline">MediBook</p>
    <h1>Booking Page</h1>
    <p>Choose a doctor, pick a date and time, and confirm your appointment.</p>
    <form className="login-form" onSubmit={submit}>
      <div className="input-group">
        <label>Doctor</label>
        <div className="input-icon-box">
          <span className="input-icon">👨‍⚕️</span>
          <select name="doctorId" defaultValue={doctorId} required>
            <option value="">Select a doctor</option>
            {doctors.map(doc=><option key={doc._id} value={doc._id}>{doc.email} — {doc.specialty||"General Physician"}</option>)}
          </select>
        </div>
      </div>
      <div className="input-group">
        <label>Date</label>
        <div className="input-icon-box">
          <span className="input-icon">📅</span>
          <input name="date" type="date" required/>
        </div>
      </div>
      <div className="input-group">
        <label>Time</label>
        <div className="input-icon-box">
          <span className="input-icon">⏰</span>
          <input name="time" type="time" required/>
        </div>
      </div>
      <div className="input-group">
        <label>Reason (optional)</label>
        <div className="input-icon-box">
          <span className="input-icon">📝</span>
          <input name="reason" type="text" placeholder="Briefly describe your reason for visit"/>
        </div>
      </div>
      {msg&&<div className={`form-message ${msg[1]}`}>{msg[0]}</div>}
      <button className="login-btn" disabled={loading}>{loading?"Booking...":"Confirm Booking"}</button>
    </form>
  </div></main></>
}

export function Dashboard({type}){
  const nav=useNavigate();
  const user=getUser();
  let title=type==="patient"?"Patient":type==="doctor"?"Doctor":"Admin";
  const[appointments,setAppointments]=useState([]);
  const[stats,setStats]=useState(null);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(null);
  const[actionMsg,setActionMsg]=useState(null);

  useEffect(()=>{
    if(!user){nav("/login");return}
    const role=user.role;
    const load=async()=>{
      setLoading(true);
      try{
        if(role==="admin"){
          const[statsRes,apptRes]=await Promise.all([api.getAdminStats(),api.getAllAppointments()]);
          setStats(statsRes);
          setAppointments(apptRes.appointments||[]);
        }else{
          const res=await api.getMyAppointments();
          setAppointments(res.appointments||[]);
        }
      }catch(err){setError(err.message)}
      finally{setLoading(false)}
    };
    load();
  },[]);

  const updateStatus=async(id,status)=>{
    try{
      await api.updateAppointmentStatus(id,status);
      setAppointments(prev=>prev.map(a=>a._id===id?{...a,status}:a));
      setActionMsg(["Appointment updated.","success"]);
    }catch(err){setActionMsg([err.message,"error"])}
  };

  const upcoming=appointments.filter(a=>a.status==="pending"||a.status==="confirmed").length;

  let data;
  if(!user){
    data=[];
  }else if(type==="patient"){
    data=[["Upcoming",`${upcoming} Appointments`],["Prescription","View Records"],["Rating","Review Doctor"]];
  }else if(type==="doctor"){
    data=[["Today",`${upcoming} Appointments`],["Patients","View Details"],["Slots","Manage Availability"]];
  }else{
    data=[["Doctors",`${stats?stats.doctors:0} Active`],["Patients",`${stats?stats.patients:0} Registered`],["Appointments",`${stats?stats.appointmentsToday:0} Today`]];
  }

  return <div className="dashboard-page"><Header/><main className="dashboard-main"><div className="dashboard-card">
    <p className="tagline">{title} Panel</p>
    <h1>Welcome to {title} Dashboard</h1>
    <p>{type==="patient"?"Here patients can view upcoming appointments, past appointments, prescriptions, and booking status.":type==="doctor"?"Here doctors can view today's appointments, patient details, availability, and prescriptions.":"Here admin can manage doctors, patients, appointments, analytics, and reviews."}</p>
    <div className="dashboard-grid">{data.map(x=><div className="stat-card" key={x[0]}><h3>{x[0]}</h3><p>{x[1]}</p></div>)}</div>

    {loading&&<p style={{marginTop:"20px"}}>Loading appointments...</p>}
    {error&&<div className="form-message error" style={{display:"block",marginTop:"20px"}}>{error}</div>}
    {actionMsg&&<div className={`form-message ${actionMsg[1]}`} style={{display:"block",marginTop:"10px"}}>{actionMsg[0]}</div>}

    {!loading&&!error&&appointments.length>0&&
      <div style={{marginTop:"25px"}}>
        <h3 style={{marginBottom:"12px"}}>{type==="admin"?"All Appointments":"Your Appointments"}</h3>
        <div className="dashboard-grid">
          {appointments.map(a=>
            <div className="stat-card" key={a._id}>
              <h3>{a.date} · {a.time}</h3>
              {type!=="patient"&&<p>Patient: {a.patient?.email}</p>}
              {type!=="doctor"&&<p>Doctor: {a.doctor?.email}</p>}
              {a.reason&&<p>Reason: {a.reason}</p>}
              <p>Status: {a.status}</p>
              {(type==="doctor"||type==="admin")&&a.status!=="completed"&&a.status!=="cancelled"&&
                <div style={{display:"flex",gap:"8px",marginTop:"10px",flexWrap:"wrap"}}>
                  {a.status==="pending"&&<button className="login-btn" style={{padding:"8px 14px"}} onClick={()=>updateStatus(a._id,"confirmed")}>Confirm</button>}
                  {a.status==="confirmed"&&<button className="login-btn" style={{padding:"8px 14px"}} onClick={()=>updateStatus(a._id,"completed")}>Mark Completed</button>}
                  <button className="login-btn" style={{padding:"8px 14px",opacity:0.8}} onClick={()=>updateStatus(a._id,"cancelled")}>Cancel</button>
                </div>
              }
            </div>
          )}
        </div>
      </div>
    }
    {!loading&&!error&&appointments.length===0&&<p style={{marginTop:"20px"}}>No appointments yet.</p>}
  </div></main></div>
}

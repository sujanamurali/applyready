
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
  company: "",
  role: "",
  status: "Applied",
  job_url: "",
  notes: "",
});

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
const [userSkills, setUserSkills] = useState("");
const [skillResults, setSkillResults] = useState(null);
const [matching, setMatching] = useState(false);
const [skillError, setSkillError] = useState("");


  async function fetchJobs() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/jobs/`);

      if (!response.ok) {
        throw new Error("Could not fetch job applications.");
      }

      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(
        "Unable to connect to the backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }
  
async function handleSubmit(event) {
  event.preventDefault();
  setSaving(true);
  setFormError("");

  try {
    const response = await fetch(`${API_URL}/api/jobs/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Could not save the application."
      );
    }

    setFormData({
      company: "",
      role: "",
      status: "Applied",
      job_url: "",
      notes: "",
    });

    setShowForm(false);
    await fetchJobs();
  } catch (err) {
    setFormError(err.message || "Something went wrong.");
  } finally {
    setSaving(false);
  }
}
async function handleSkillMatch(event) {
  event.preventDefault();

  setMatching(true);
  setSkillError("");
  setSkillResults(null);

  try {
    const response = await fetch(`${API_URL}/api/skills/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_description: jobDescription,
        user_skills: userSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to compare skills.");
    }

    setSkillResults(data);
  } catch (err) {
    setSkillError(
      err.message || "Could not connect to the backend."
    );
  } finally {
    setMatching(false);
  }
}

async function updateJobStatus(jobId, newStatus) {
  try {
    const response = await fetch(
      `${API_URL}/api/jobs/${jobId}/status?status=${encodeURIComponent(newStatus)}`,
      { method: "PATCH" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Could not update status.");
    }

    await fetchJobs();
  } catch (err) {
    alert(err.message || "Failed to update application status.");
  }
}

async function deleteJob(jobId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this application?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_URL}/api/jobs/${jobId}`,
      { method: "DELETE" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Could not delete application.");
    }

    await fetchJobs();
  } catch (err) {
    alert(err.message || "Failed to delete application.");
  }
}



  useEffect(() => {
    fetchJobs();
  }, []);

  const counts = {
    total: jobs.length,
    applied: jobs.filter((job) => job.status === "Applied").length,
    interviews: jobs.filter((job) => job.status === "Interview").length,
    offers: jobs.filter((job) => job.status === "Offer").length,
     rejected: jobs.filter((job) => job.status === "Rejected").length,
  };

  
const filteredJobs = jobs.filter((job) => {
  const search = searchTerm.toLowerCase().trim();

  const matchesSearch =
    job.company.toLowerCase().includes(search) ||
    job.role.toLowerCase().includes(search);

  const matchesStatus =
    statusFilter === "All" || job.status === statusFilter;

  return matchesSearch && matchesStatus;
});


  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">A</span>
          <span>ApplyReady</span>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <div className="nav-item active">▦ &nbsp; Dashboard</div>
        <div className="nav-item">▤ &nbsp; Applications</div>
        <div className="nav-item">✦ &nbsp; Interview Prep</div>

        <div className="sidebar-bottom">
          <div className="profile-avatar">S</div>
          <div>
            <strong>My Workspace</strong>
            <p>Job seeker</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR CAREER WORKSPACE</p>
            <h1>Dashboard</h1>
          </div>
          <div className="header-actions">
            <button className="refresh-button" onClick={fetchJobs}>
            ↻ Refresh
            </button>
            <button
              className="add-button"
              onClick={()=> setShowForm(!showForm)}
            >
              + Add Application
            </button>
          </div>
          
        </header>

        <section className="welcome">
          <div>
            <p className="welcome-tag">YOUR NEXT OPPORTUNITY STARTS HERE</p>
            <h2>Make your next move count.</h2>
            <p>
              Track your applications, follow your progress, and stay ready
              for every interview.
            </p>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <span>✦</span>
            <div className="art-card">✓</div>
            <span>↗</span>
          </div>
        </section>
        
{showForm && (
  <section className="form-section">
    <div className="section-heading">
      <div>
        <h2>Add Job Application</h2>
        <p>Keep track of your next opportunity.</p>
      </div>

      <button
        className="refresh-button"
        type="button"
        onClick={() => setShowForm(false)}
      >
        Cancel
      </button>
    </div>

    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Company name *
          <input
            required
            maxLength={100}
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            placeholder="e.g. Infosys"
          />
        </label>

        <label>
          Job role *
          <input
            required
            maxLength={100}
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
            placeholder="e.g. Python Developer"
          />
        </label>

        <label>
          Application status
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          >
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
        </label>

        <label>
          Job URL
          <input
            type="url"
            value={formData.job_url}
            onChange={(e) =>
              setFormData({ ...formData, job_url: e.target.value })
            }
            placeholder="https://..."
          />
        </label>

        <label className="full-width">
          Notes
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Recruiter details, interview date, or notes"
          />
        </label>
      </div>

      {formError && <p className="form-error">{formError}</p>}

      <button className="add-button" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Application"}
      </button>
    </form>
  </section>
)}


        <section className="stats-grid">
          <StatCard label="Total Applications" value={counts.total} icon="▤" />
          <StatCard label="Applied" value={counts.applied} icon="↗" />
          <StatCard label="Interviews" value={counts.interviews} icon="▣" />
          <StatCard label="Offers" value={counts.offers} icon="★" />
          <StatCard
  label="Rejected"
  value={counts.rejected}
  icon="×"
/>
        </section>

        <section className="skill-matcher">
  <h2>Job Description Skill Matcher</h2>
  <p>
    Compare your skills with a job description and identify
    the skills you may need to improve.
  </p>

  <form onSubmit={handleSkillMatch}>
    <label htmlFor="job-description">
      Job Description
    </label>

    <textarea
      id="job-description"
      value={jobDescription}
      onChange={(event) => setJobDescription(event.target.value)}
      placeholder="Paste the job description here..."
      required
      rows={6}
    />

    <label htmlFor="user-skills">
      Your Skills
    </label>

    <input
      id="user-skills"
      value={userSkills}
      onChange={(event) => setUserSkills(event.target.value)}
      placeholder="Python, React, MongoDB, REST API"
      required
    />

    <button type="submit" disabled={matching}>
      {matching ? "Analyzing..." : "Analyze Skill Match"}
    </button>
  </form>

  {skillError && <p className="skill-error">{skillError}</p>}

  {skillResults && (
    <div className="skill-results">
      <div className="skill-match-summary">
  <div className="skill-match-heading">
    <h3>Skill Match</h3>
    <strong>{skillResults.match_percentage}%</strong>
  </div>

  <div
    className="skill-progress-track"
    role="progressbar"
    aria-label="Skill match percentage"
    aria-valuenow={skillResults.match_percentage}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div
      className="skill-progress-fill"
      style={{
        width: `${skillResults.match_percentage}%`,
      }}
    />
  </div>
</div>

      <p>
        Required skills found: {skillResults.total_required}
      </p>

      <h4>Matched Skills</h4>
      {skillResults.matched_skills.length > 0 ? (
        <p>{skillResults.matched_skills.join(", ")}</p>
      ) : (
        <p>No matching skills found.</p>
      )}

      
<h4>Skills to Improve</h4>

{skillResults.missing_skills.length > 0 ? (
  <>
    <p>{skillResults.missing_skills.join(", ")}</p>

    <h4>Recommended Learning Steps</h4>

    <div className="learning-recommendations">
      {skillResults.learning_recommendations.map((item) => (
        <div className="recommendation-card" key={item.skill}>
          <h5>{item.skill}</h5>
          <p>{item.recommendation}</p>
        </div>
      ))}
    </div>
  </>
) : (
  <p>No missing skills detected. Great job!</p>
)}

    </div>
  )}
</section>

        <section className="applications-section">
          
<div className="section-heading">
  <div>
    <h2>Recent Applications</h2>
    <p>Your latest job application activity</p>
  </div>

  <span className="application-count">
    {filteredJobs.length} records
  </span>
</div>

<div className="application-filters">
  <input
    type="search"
    placeholder="Search company or job role..."
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
    aria-label="Search applications by company or role"
  />

  <select
    value={statusFilter}
    onChange={(event) => setStatusFilter(event.target.value)}
    aria-label="Filter applications by status"
  >
    <option value="All">All statuses</option>
    <option value="Applied">Applied</option>
    <option value="Interview">Interview</option>
    <option value="Offer">Offer</option>
    <option value="Rejected">Rejected</option>
  </select>
</div>


          {loading ? (
            <div className="empty-state">Loading your applications...</div>
          ) : error ? (
            <div className="empty-state error-state">
              <p>{error}</p>
              <button className="primary-button" onClick={fetchJobs}>
                Try again
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">▤</div>
              <h3>Your journey starts with one application</h3>
              <p>
                Once you add job applications, they will appear here.
              </p>
           </div>
) : filteredJobs.length === 0 ? (
  <div className="empty-state">
    <h3>No matching applications found</h3>
    <p>Try a different search term or status filter.</p>
  </div>
) : (
  <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>COMPANY & ROLE</th>
                    <th>STATUS</th>
                    <th>DATE ADDED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                
<tbody>
  {filteredJobs.map((job) => (
    <tr key={job.id}>
      <td>
        <strong>{job.company}</strong>
        <p className="role-name">{job.role}</p>
      </td>

      <td>
        <span
          className={`status status-${job.status.toLowerCase()}`}
        >
          {job.status}
        </span>
      </td>

      <td>
        {job.created_at
          ? new Date(job.created_at).toLocaleDateString()
          : "—"}
      </td>

      <td>
        <div className="row-actions">
          <select
            className="status-select"
            value={job.status}
            aria-label={`Update status for ${job.company}`}
            onChange={(e) =>
              updateJobStatus(job.id, e.target.value)
            }
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            className="delete-button"
            onClick={() => deleteJob(job.id)}
            aria-label={`Delete ${job.company} application`}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

              </table>
            </div>
          )}
        </section>

        <footer>ApplyReady · Built to make your job search more organized.</footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default App;

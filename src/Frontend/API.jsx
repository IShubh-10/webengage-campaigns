import React, { useState, useEffect } from "react";

export default function API() {
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    tags: "",
    asanaLink: "",
    code: "",
  });
  const [editingId, setEditingId] = useState(null);

  // ✅ FIXED API URL
 const API_URL = import.meta.env.VITE_API_URL;

  // ================= FETCH =================
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(API_URL);
      console.log("📡 Status:", response.status);

      const data = await response.json();
      console.log("📦 API Response:", data);

      setCampaigns(data);
    } catch (error) {
      console.error("❌ Error fetching:", error);
    }
  };

  // ================= FORM =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API_URL}/${editingId}`
      : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      console.log("✅ Response:", result);

      fetchCampaigns();
      resetForm();
    } catch (error) {
      console.error("❌ Save error:", error);
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditingId(item.id);

    setFormData({
      title: item.title,
      type: item.type,
      tags: item.tags,
      asanaLink: item.asanaLink || "", // ✅ FIXED
      code: item.code,
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      console.log("🗑 Deleted:", id);
      fetchCampaigns();
    } catch (error) {
      console.error("❌ Delete error:", error);
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      type: "",
      tags: "",
      asanaLink: "",
      code: "",
    });
  };

  // ================= UI =================
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Campaign Gallery</h2>

      {/* ===== FORM ===== */}
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
        <br /><br />

        <input name="type" placeholder="Type" value={formData.type} onChange={handleChange} />
        <br /><br />

        <input name="tags" placeholder="Tags" value={formData.tags} onChange={handleChange} />
        <br /><br />

        <input name="asanaLink" placeholder="Asana Link" value={formData.asanaLink} onChange={handleChange} />
        <br /><br />

        <textarea name="code" placeholder="Code" value={formData.code} onChange={handleChange} />
        <br /><br />

        <button type="submit">
          {editingId ? "Update" : "Add"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm} style={{ marginLeft: "10px" }}>
            Cancel
          </button>
        )}
      </form>

      <hr />

      {/* ===== LIST ===== */}
      {campaigns.map((item) => (
        <div key={item.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <h3>{item.title}</h3>
          <p><b>Type:</b> {item.type}</p>
          <p><b>Tags:</b> {item.tags}</p>

          <button onClick={() => handleEdit(item)}>Edit</button>
          <button onClick={() => handleDelete(item.id)} style={{ marginLeft: "10px" }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
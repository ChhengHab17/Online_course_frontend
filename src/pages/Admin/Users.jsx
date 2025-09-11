"use client"

import { useState, useEffect } from "react"
import { ChevronDownIcon, UserIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"

export default function Users() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("")
  const [editingUser, setEditingUser] = useState(null)
  const [newPassword, setNewPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)


  useEffect(() => {
    const fetchUsers = async () => {
      try {
  const res = await fetch("https://backend-hosting-d4f6.onrender.com/api/user")
        const data = await res.json()
        setUsers(data.users || data || [])
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const name = user.username || user.email || ""
    const email = user.email || ""
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "" || user.role === filterRole
    return matchesSearch && matchesRole
  })
  const roles = {
  admin: "689a1b8c2c9d87867bbe472d", // replace with actual role _id
  user: "689a1b6d2c9d87867bbe472c",
};

  const handleBlockToggle = async (userId, status) => {
    try {
  const res = await fetch(`https://backend-hosting-d4f6.onrender.com/api/user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !status }),
      })
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u._id === userId || u.id === userId ? { ...u, status: !status } : u)))
      } else {
        const data = await res.json()
        alert(data.message || "Failed to update user status")
      }
    } catch (error) {
      console.log("API error, updating locally for demo")
      setUsers((prev) => prev.map((u) => (u._id === userId || u.id === userId ? { ...u, status: !status } : u)))
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    const userId = editingUser?._id || editingUser?.id
    if (!userId) return alert("No user selected")
    if (!newPassword) return alert("Enter new password")

    setIsUpdating(true)
    try {
  const response = await fetch(`https://backend-hosting-d4f6.onrender.com/api/user/change-password/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      alert("Password changed successfully ✅")
      setNewPassword("")
      setEditingUser(null)
    } catch (error) {
      console.error("Password change error:", error)
      alert("Failed to change password ❌")
    } finally {
      setIsUpdating(false)
    }
  }

const handleRoleChange = async (userId, newRoleId) => {
  setOpenDropdown(null); // close dropdown immediately
  try {
  const res = await fetch(`https://backend-hosting-d4f6.onrender.com/api/user/change-role/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role_id: newRoleId }),
    });
    const data = await res.json();

    if (res.ok) {
      // Update users list with new role
      setUsers(prev =>
        prev.map(u =>
          u.id === userId
            ? { ...u, role: data.user.role_id.role_name.toLowerCase() } // ensure lowercase
            : u
        )
      );
      alert("Role updated ✅");
    } else {
      alert(data.message || "Failed to update role ❌");
    }
  } catch (error) {
    console.error("Error updating role:", error);
    alert("Something went wrong ❌");
  }
};



  const handleEditClick = (user) => {
    setEditingUser({ ...user })
    setNewPassword("")
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setNewPassword("")
  }

  const getRoleIcon = (role) => {
    return role === "admin" ? <ShieldCheckIcon className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />
  }

  const toggleDropdown = (userId) => setOpenDropdown(openDropdown === userId ? null : userId)

  return (
    <div className="px-0 py-4 sm:px-6 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-2">User Management</h1>
      <p className="text-slate-600 mb-6 sm:mb-8 text-sm sm:text-base">
        Manage user accounts, roles, and permissions. Monitor user activity and control access to your e-learning platform.
      </p>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full min-w-[600px] text-xs sm:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id || user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#2C3E50] rounded-full flex items-center justify-center text-white font-semibold">
                      {user.username?.charAt(0) || "U"}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(user.id)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 min-w-[100px]"
                    >
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                      <ChevronDownIcon className="w-4 h-4 text-gray-400 ml-auto" />
                    </button>

                    {openDropdown === user.id && (
                      <div className="absolute top-full left-0 mt-1 w-full min-w-[120px] bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleRoleChange(user.id, roles.admin)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <ShieldCheckIcon className="w-4 h-4 text-gray-500" />
                            <span>Admin</span>
                          </button>
                          <button
                            onClick={() => handleRoleChange(user.id, roles.user)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <UserIcon className="w-4 h-4 text-gray-500" />
                            <span>User</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.status ? "Blocked" : "Unblocked"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button
                    onClick={() => handleBlockToggle(user._id ?? user.id, user.status)}
                    className={`${user.status ? "text-green-600 hover:text-green-900" : "text-red-600 hover:text-red-900"}`}
                  >
                    {user.status ? "Unblock" : "Block"}
                  </button>

                  <button onClick={() => handleEditClick(user)} className="text-blue-600 hover:text-blue-900">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password Modal */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-3 sm:p-6 w-full max-w-xs sm:max-w-md mx-2 sm:mx-4 shadow-2xl border-2 border-gray-300 pointer-events-auto">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
              Change Password for {editingUser.username || editingUser.email}
            </h2>
            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex justify-end space-x-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 text-xs sm:text-sm"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2C3E50] text-white rounded-lg hover:bg-[#1A252F] disabled:opacity-50 text-xs sm:text-sm"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

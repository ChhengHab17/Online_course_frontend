"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export default function Dashboard() {
  const navigate = useNavigate()
  const chartRef = useRef(null)
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    enrollments: 0,
    revenue: 0,
    activeUsers: 0,
    newSignups: 0,
    completionRate: 0,
    todayIncome: 0,
    weekIncome: 0,
    monthIncome: 0,
    incomeGrowth: 0,
  })

  const [enrollmentData, setEnrollmentData] = useState([])
  const [courseData, setCourseData] = useState([])
  const [dailyIncomeData, setDailyIncomeData] = useState([])
  // Responsive flag
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
  const res = await fetch("https://backend-hosting-d4f6.onrender.com/api/dashboard/stats")
        if (!res.ok) throw new Error("Failed to fetch stats")

        const data = await res.json()

        setStats((prev) => ({
          ...prev,
          users: data.totalUsers || 0,
          usersGrowth: data.usersGrowth || 0,
          courses: data.totalCourses || 0,
          newCoursesThisWeek: data.newCoursesThisWeek || 0,
          enrollments: data.totalEnrollments || 0,
          enrollmentsGrowth: data.enrollmentsGrowth || 0,
          newSignups: data.newSignups || 0,
          activeUsers: data.activeUsersToday || 0,
          completionRate: data.completionRate || 0,
          todayIncome: data.todayIncome || 0,
          weekIncome: data.weekIncome || 0,
          monthIncome: data.monthIncome || 0,
          incomeGrowth: data.incomeGrowth || 0,
        }))
        if (data.monthlyStats) {
          setEnrollmentData(data.monthlyStats)
        }
        if (data.courseDistribution) {
          setCourseData(data.courseDistribution);
        }
        if (data.dailyIncome) {
          setDailyIncomeData(data.dailyIncome);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      }
    }

    fetchStats()
  }, [])

  // Watch viewport size for mobile tweaks
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)")
    const onChange = (e) => setIsMobile(e.matches)
    // Initialize
    setIsMobile(mq.matches)
    // Add listener with cross-browser support
    try { mq.addEventListener("change", onChange) } catch { mq.addListener(onChange) }
    return () => {
      try { mq.removeEventListener("change", onChange) } catch { mq.removeListener(onChange) }
    }
  }, [])

  const handleAddCourse = () => {
    navigate("/admin/manage-course") // React Router navigation
  }

  const handleManageUser = () => {
    navigate("/admin/user")
  }

  const handleViewAnalytics = () => {
    chartRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="px-0 py-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Welcome back! Here's what's happening with your e-learning platform.</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white border-0 shadow-sm rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.users.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1">{stats.usersGrowth}% from last month</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2C3E50]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#2C3E50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-0 shadow-sm rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Active Courses</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.courses.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1">+{stats.newCoursesThisWeek} new this week</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#27AE60]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#27AE60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-0 shadow-sm rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Enrollments</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.enrollments.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1">+{stats.enrollmentsGrowth}% from last month</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8E44AD]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#8E44AD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-0 shadow-sm rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Monthly Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">${stats.monthIncome.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1">{stats.incomeGrowth}% from last month</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F39C12]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#F39C12]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Income Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1">Today's Income</p>
                <p className="text-xl sm:text-2xl font-bold">${stats.todayIncome.toLocaleString()}</p>
                <p className="text-blue-200 text-xs sm:text-sm mt-1">Revenue today</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs sm:text-sm font-medium mb-1">This Week</p>
                <p className="text-xl sm:text-2xl font-bold">${stats.weekIncome.toLocaleString()}</p>
                <p className="text-green-200 text-xs sm:text-sm mt-1">Weekly revenue</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm font-medium mb-1">This Month</p>
                <p className="text-xl sm:text-2xl font-bold">${stats.monthIncome.toLocaleString()}</p>
                <p className="text-purple-200 text-xs sm:text-sm mt-1">{stats.incomeGrowth}% growth</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-0 shadow-sm rounded-lg mb-6 sm:mb-8">
        <div className="p-4 sm:p-6 sm:pb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <button
              onClick={handleAddCourse}
              className="w-full sm:w-auto bg-[#2C3E50]/10 text-[#2C3E50] hover:bg-[#2C3E50]/20 border-0 px-4 py-2 rounded-md flex items-center justify-center sm:justify-start transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Course
            </button>
            <button
              onClick={handleManageUser}
              className="w-full sm:w-auto bg-[#27AE60]/10 text-[#27AE60] hover:bg-[#27AE60]/20 border-0 px-4 py-2 rounded-md flex items-center justify-center sm:justify-start transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Manage Users
            </button>
            <button
              onClick={handleViewAnalytics}
              className="w-full sm:w-auto bg-[#8E44AD]/10 text-[#8E44AD] hover:bg-[#8E44AD]/20 border-0 px-4 py-2 rounded-md flex items-center justify-center sm:justify-start transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white border-0 shadow-sm rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Course Completion Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 relative">
                <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#27AE60]"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${stats.completionRate}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-0 shadow-sm rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Active Users Today</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Online now</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white border-0 shadow-sm rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">New Signups</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.newSignups}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">This week</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#3498DB]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#3498DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div ref={chartRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white border-0 shadow-sm rounded-lg">
          <div className="p-4 sm:p-6 sm:pb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Daily Income Trends</h3>
            <p className="text-xs sm:text-sm text-gray-600">Last 7 days revenue</p>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className={isMobile ? "h-48" : "h-64"}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyIncomeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    className="text-xs sm:text-sm text-gray-600"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    className="text-xs sm:text-sm text-gray-600"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Income"]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  />
                  <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white border-0 shadow-sm rounded-lg">
          <div className="p-4 sm:p-6 sm:pb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">User & Enrollments</h3>
            <p className="text-xs sm:text-sm text-gray-600">Monthly overview</p>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className={isMobile ? "h-48" : "h-64"}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs sm:text-sm text-gray-600" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs sm:text-sm text-gray-600" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar dataKey="enrollments" fill="#2C3E50" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="users" fill="#27AE60" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white border-0 shadow-sm rounded-lg lg:col-span-2">
          <div className="p-4 sm:p-6 sm:pb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Course Enrollment Distribution</h3>
            <p className="text-xs sm:text-sm text-gray-600">Top performing courses</p>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            <div className={isMobile ? "h-56" : "h-64"}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 50 : 60}
                    outerRadius={isMobile ? 80 : 100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {courseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value, name, props) => [
                      `${value} enrollments`,
                      props.payload.name
                    ]}
                  />
                  {!isMobile && (
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px", color: "#6B7280" }}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

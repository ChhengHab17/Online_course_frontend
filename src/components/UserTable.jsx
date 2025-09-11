import { useState, useEffect } from "react";
import { Eye, Search, Filter, Users, Calendar, Mail, BookOpen, Clock, CreditCard } from "lucide-react";
import { api } from "../services/api";

export default function UserTable({ users, onUserClick, loading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterEnrollment, setFilterEnrollment] = useState("");
  const [sortBy, setSortBy] = useState("all-enrollments");
  const [userEnrollments, setUserEnrollments] = useState({});
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  // Fetch enrollment data for all users
  useEffect(() => {
    if (users.length > 0) {
      fetchAllUserEnrollments();
    }
  }, [users]);

  const fetchAllUserEnrollments = async () => {
    try {
      setEnrollmentLoading(true);
      const enrollmentData = {};
      
      // Fetch all courses first to get accurate pricing
      const allCourses = await api.getCourses();
      console.log("All courses fetched:", allCourses);
      const courseMap = new Map(allCourses.map(course => [course._id, course]));
      
      // Fetch enrollments for each user
      await Promise.all(
        users.map(async (user) => {
          console.log(`Processing user:`, user);
          const userId = user.id || user._id;
          console.log(`Using user ID: ${userId}`);
          
          try {
            const userEnrollmentData = await api.getUserEnrollments(userId);
            const enrollments = userEnrollmentData.data || userEnrollmentData || [];
            console.log(`User ${user.username} (ID: ${userId}) enrollments:`, enrollments);
            
            // Log each enrollment structure to understand the data
            enrollments.forEach((enrollment, index) => {
              console.log(`Enrollment ${index}:`, {
                _id: enrollment._id,
                course_id: enrollment.course_id,
                course: enrollment.course,
                courseId: enrollment.courseId,
                payment_status: enrollment.payment_status,
                fullObject: enrollment
              });
            });
            
            // Filter out enrollments where course is deleted/null
            // Try different possible course ID fields including enrollment._id
            const validEnrollments = enrollments.filter(e => {
              // Try multiple possible ways to get course ID
              const possibleCourseIds = [
                e.course_id,
                e.course?._id,
                e.course,
                e.courseId,
                e._id // Sometimes enrollment ID might be the course ID
              ];
              
              let courseId = null;
              let foundCourse = null;
              
              // Try each possible course ID
              for (const id of possibleCourseIds) {
                if (id && typeof id === 'string' && courseMap.has(id)) {
                  courseId = id;
                  foundCourse = courseMap.get(id);
                  break;
                }
              }
              
              if (!foundCourse) {
                console.log(`No matching course found for enrollment:`, e);
                console.log(`Tried IDs:`, possibleCourseIds);
                console.log(`Available course IDs:`, Array.from(courseMap.keys()).slice(0, 5), '...');
              } else {
                console.log(`Found matching course for enrollment ${e._id}:`, foundCourse.course_title);
              }
              
              return !!foundCourse;
            });
            
            console.log(`Valid enrollments for ${user.username}:`, validEnrollments);
            
            // Count only paid enrollments for courses that currently have a price > 0
            const paidEnrollments = validEnrollments.filter(e => {
              if (e.payment_status !== "paid") return false;
              
              // Get the course and check if it currently has a price > 0
              const possibleCourseIds = [
                e.course_id,
                e.course?._id,
                e.course,
                e.courseId,
                e._id
              ];
              
              let course = null;
              for (const id of possibleCourseIds) {
                if (id && typeof id === 'string' && courseMap.has(id)) {
                  course = courseMap.get(id);
                  break;
                }
              }
              
              if (!course) return false;
              
              const coursePrice = course.course_price || course.price || 0;
              // Only count if the course currently has a price > 0
              return parseFloat(coursePrice) > 0;
            });
            
            // Calculate total spending using course data from backend
            const totalSpending = paidEnrollments
              .reduce((sum, enrollment) => {
                // Try multiple possible ways to get course ID
                const possibleCourseIds = [
                  enrollment.course_id,
                  enrollment.course?._id,
                  enrollment.course,
                  enrollment.courseId,
                  enrollment._id
                ];
                
                let course = null;
                for (const id of possibleCourseIds) {
                  if (id && typeof id === 'string' && courseMap.has(id)) {
                    course = courseMap.get(id);
                    break;
                  }
                }
                
                const coursePrice = course?.course_price || course?.price || 0;
                console.log(`Course ${course?._id || 'unknown'} (${course?.course_title || 'unknown'}) price:`, coursePrice);
                // Only count courses that have a price > 0
                return coursePrice > 0 ? sum + parseFloat(coursePrice) : sum;
              }, 0);
            
            console.log(`Total spending for ${user.username}: $${totalSpending}`);
            
            enrollmentData[userId] = {
              total: paidEnrollments.length, // Count only paid enrollments for courses with current price > 0
              totalSpending: totalSpending
            };
            
            console.log(`Final data for ${user.username} (ID: ${userId}):`, enrollmentData[userId]);
          } catch (error) {
            console.error(`Error fetching enrollments for user ${userId}:`, error);
            enrollmentData[userId] = { total: 0, totalSpending: 0 };
          }
        })
      );
      
      console.log("Final enrollment data before setting state:", enrollmentData);
      setUserEnrollments(enrollmentData);
      console.log("State updated with enrollment data");
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "" || user.role === filterRole;
    
    // Enrollment-based filtering
    const userId = user.id || user._id;
    const userEnrollmentData = userEnrollments[userId] || { total: 0, totalSpending: 0 };
    const matchesEnrollment = filterEnrollment === "" || 
                             (filterEnrollment === "has-spending" && userEnrollmentData.totalSpending > 0) ||
                             (filterEnrollment === "no-enrollments" && userEnrollmentData.total === 0);
    
    return matchesSearch && matchesRole && matchesEnrollment;
  });

  // Sort users based on enrollment data
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aUserId = a.id || a._id;
    const bUserId = b.id || b._id;
    const aEnrollments = userEnrollments[aUserId] || { total: 0, totalSpending: 0 };
    const bEnrollments = userEnrollments[bUserId] || { total: 0, totalSpending: 0 };
    
    switch (sortBy) {
      case "total-spending-desc":
        return bEnrollments.totalSpending - aEnrollments.totalSpending;
      case "all-enrollments-desc":
        return bEnrollments.total - aEnrollments.total;
      case "all-enrollments":
      default:
        return 0; // No sorting, keep original order
    }
  });

  const getEnrollmentStats = (userId) => {
    const enrollmentData = userEnrollments[userId] || { total: 0, totalSpending: 0 };
    console.log(`Getting enrollment stats for user ${userId}:`, enrollmentData);
    console.log(`Current userEnrollments state:`, userEnrollments);
    return enrollmentData;
  };

  const getEnrollmentBadge = (type, value) => {
    const configs = {
      total: { bg: "bg-[#2C3E50]/10", text: "text-[#2C3E50]", icon: BookOpen },
      spending: { bg: "bg-green-100", text: "text-green-800", icon: CreditCard }
    };
    
    const config = configs[type];
    const Icon = config.icon;
    
    const displayValue = type === 'spending' ? `$${value.toFixed(2)}` : value;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {displayValue}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      Admin: { bg: "bg-purple-100", text: "text-purple-800" },
      Teacher: { bg: "bg-[#2C3E50]/10", text: "text-[#2C3E50]" },
      User: { bg: "bg-gray-100", text: "text-gray-800" },
    };
    
    const config = roleConfig[role] || roleConfig.User;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {role}
      </span>
    );
  };

  // Get unique roles for filter dropdown
  const uniqueRoles = [...new Set(users.map(user => user.role))];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with Search and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2C3E50]" />
            <h2 className="text-lg font-semibold text-gray-900">
              User Management ({sortedUsers.length} users)
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
              />
            </div>
            
            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
            >
              <option value="all-enrollments">Default Order</option>
              <option value="all-enrollments-desc">Most Enrollments</option>
              <option value="total-spending-desc">Highest Spending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Enrollments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spending
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => {
                const userId = user.id || user._id;
                const enrollmentStats = getEnrollmentStats(userId);
                return (
                  <tr key={userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-[#2C3E50] flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enrollmentLoading ? (
                        <div className="animate-pulse h-6 bg-gray-200 rounded w-12"></div>
                      ) : (
                        getEnrollmentBadge("total", enrollmentStats.total)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enrollmentLoading ? (
                        <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
                      ) : (
                        getEnrollmentBadge("spending", enrollmentStats.totalSpending)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onUserClick(user)}
                        className="text-[#2C3E50] hover:text-[#1E2B3A] flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No users found matching your criteria</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

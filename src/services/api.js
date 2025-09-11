import axios from "axios";
const BASE_URL = 'https://backend-hosting-d4f6.onrender.com/api';
// Axios interceptor to add JWT token to Authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = {
  // Course endpoints
  getCourses: async () => {
    const response = await fetch(`${BASE_URL}/course`);
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    return response.json();
  },

  getCourseById: async (id) => {
    const courses = await api.getCourses();
    const course = courses.find(c => c._id === id);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  },

  // Category endpoints
  getCategories: async () => {
    const response = await fetch(`${BASE_URL}/category`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  },

  // Lesson endpoints
  getLessons: async () => {
    const response = await fetch(`${BASE_URL}/lessons`);
    if (!response.ok) {
      throw new Error('Failed to fetch lessons');
    }
    return response.json();
  },

  // User management endpoints
  getAllUsers: async () => {
    try {
      const result = await axios.get(`${BASE_URL}/user`);
      return result.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const result = await axios.get(`${BASE_URL}/user/${userId}`);
      return result.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  getUserEnrollments: async (userId) => {
    try {
      const result = await axios.get(`${BASE_URL}/enrollment/user/${userId}`);
      return result.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};

export const createVideo = async (videoData) => {
  try {
    const result = await axios.post(`${BASE_URL}/video`, videoData);
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateVideo = async (videoId, videoData) => {
  try {
    const result = await axios.patch(`${BASE_URL}/video/${videoId}`, videoData);
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getVideoById = async (videoId) => {
  try {
    const result = await axios.get(`${BASE_URL}/video/${videoId}`);
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getVideosByLessonId = async (lessonId) => {
  try {
    const result = await axios.get(`${BASE_URL}/video/lesson/${lessonId}`);
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getVideosByCourseId = async (courseId) => {
  try {
    const result = await axios.get(`${BASE_URL}/video/course/${courseId}`);
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllVideos = async () => {
  try {
    const result = await axios.get(`${BASE_URL}/video`);
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteVideo = async (videoId) => {
  try {
    const result = await axios.delete(`${BASE_URL}/video/${videoId}`);
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const signup = async (username, email, password) =>{
    try{
        const result = await axios.post(`${BASE_URL}/auth/signup`,{
            username,
            email,
            password,
        })
        return result.data;
    }catch(error){
        console.log(error);
        throw(error);
    }
}
export const signin = async (email, password) => {
    try{
        const result = await axios.post(`${BASE_URL}/auth/signin`,{
            email,
            password
        })
        return result.data;
    }catch(error){
        console.log(error);
        throw(error);
    }
}
export const sendCode = async (email) => {
    try{
        const result = await axios.patch(`${BASE_URL}/auth/verification-code`, {
            email
        })
        return result.data;
    }catch(error){
        console.log(error);
        throw(error);
    }
}
export const verifyCode = async (email, providedCode) => {
    try {
        const result = axios.patch(`${BASE_URL}/auth/verify-code`,{
            email,
            providedCode
        })
        return (await result).data;
    } catch (error) {
        console.log(error);
        throw(error);
    }
}
export const sendForgotPasswordCode = async (email) => {
    try{
        const result = await axios.patch(`${BASE_URL}/auth/send-forgotPassword`, {
            email
        })
        return result.data;
    }catch(error){
        console.log(error);
        throw(error);
    }
}
export const verifyForgotPasswordCode = async (email, providedCode) => {
    try {
        const result = axios.patch(`${BASE_URL}/auth/verify-forgotPassword`,{
            email,
            providedCode
        })
        return (await result).data;
    } catch (error) {
        console.log(error);
        throw(error);
    }
}
export const resetPassword = async (email, password) => {
    try {
        const result = await axios.patch(`${BASE_URL}/auth/change-forgot-password`,{
            email,
            password
        })
        return (await result).data;
    } catch (error) {
        console.log(error);
        throw(error);
    }
}
/**
 * Generate Bakong QR for payment
 * @param {number} amount - The payment amount
 * @param {string} orderId - Unique ID for this order
 * @returns {Promise<{success: boolean, qrImage?: string, shortLink?: string, message?: string}>}
 */
export const generateQR = async (amount, orderId) => {
  try {
    const result = await axios.post(`${BASE_URL}/payment/generate`, {
      amount,
      currency: "USD",
    });
    return result.data;
  } catch (error) {
    console.error('Generate QR error:', error);
    throw error;
  }
};

/**
 * Check transaction status by MD5 hash
 * @param {string} md5Hash
 * @returns {Promise<any>}
 */
export const checkTransaction = async (md5Hash) => {
  try {
    const result = await axios.post(`${BASE_URL}/payment/verify`, {
      md5: md5Hash,
    });
    return result.data;
  } catch (error) {
    console.error('Check transaction error:', error);
    throw error;
  }
};
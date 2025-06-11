// import axios from "axios";
// // import config from "../services/configService";

// // export const uploadStub = (stubData) => {
// //   return axios.post(
// //     `${config.VITE_APP_API_BASE_URL}/api/stubs/upload`,
// //     stubData,
// //     {
// //       headers: {
// //         "Content-Type": "multipart/form-data",
// //       },
// //     }
// //   );
// // };

// // export const uploadStub = (stubData) => {
// //   return axios.post(
// //     `${config.VITE_APP_API_BASE_URL}/api/stubs/upload`,
// //     stubData,
// //     {
// //       withCredentials: true,
// //       headers: { "Content-Type": "multipart/form-data" },
// //     }
// //   );
// // };
// // const api = axios.create({
// //   baseURL: config.VITE_APP_API_BASE_URL || "http://localhost:5000", // Fallback to localhost if not set
// //   withCredentials: true, // Correct property name (not "credentials")
// // });

// // export const uploadStub = (stubData) => {
// //   return api.post("/api/stubs/upload", stubData, {
// //     headers: { "Content-Type": "multipart/form-data" },
// //   });
// // };

// // Base API function with cookie configuration
// const api = {
//   post: async (data = {}) => {
//     const url = `http://localhost:5000/api/stubs/upload`;
//     const headers = {
//       "Content-Type": "application/json",
//       Cookie:
//         "session=.eJwlzjEOwjAMRuG7ZGaw_ziO28tUdWIL1pZOiLtTiektb_g-ZcsjzmdZ38cVj7K9ZlmLC7J12Wm6aiOyaNbZzUA7iUGx84hRFRAKu580SR8I9JpTet3vgmWqtFERQ52rYzFH72wDxglq2hcVt5wcCE1JEk1nKjfkOuP4a7h8fy4KLbQ.aEbY_g.j_RDHPlO89OeToEwResBO6LsycQ",
//     };

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         credentials: "include",
//         headers,
//         body: data instanceof FormData ? data : JSON.stringify(data),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error("API call failed:", error);
//       throw error;
//     }
//   },
// };

// // Stub data upload function
// export const uploadStub = (stubData) => {
//   // If stubData is FormData, use multipart/form-data, otherwise use default JSON
//   const isFormData = stubData instanceof FormData;
//   const contentType = isFormData ? "multipart/form-data" : "application/json";

//   return api.post("/api/stubs/upload", stubData, {
//     headers: {
//       "Content-Type": contentType,
//       // Include other headers if needed
//     },
//   });
// };

// // Example usage:
// // For JSON data:
// // uploadStub({name: "test", data: {}}).then(...)
// //
// // For FormData:
// // const formData = new FormData();
// // formData.append('file', fileInput.files[0]);
// // uploadStub(formData).then(...)

import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:5000", // Set your base URL here
  withCredentials: true, // Important for sending cookies
  headers: {
    "Content-Type": "application/json",
    Cookie:
      "session=.eJwlzjEOwjAMRuG7ZGaw_ziO28tUdWIL1pZOiLtTiektb_g-ZcsjzmdZ38cVj7K9ZlmLC7J12Wm6aiOyaNbZzUA7iUGx84hRFRAKu580SR8I9JpTet3vgmWqtFERQ52rYzFH72wDxglq2hcVt5wcCE1JEk1nKjfkOuP4a7h8fy4KLbQ.aEbY_g.j_RDHPlO89OeToEwResBO6LsycQ",
  },
});

// Request interceptor to handle content type for FormData
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Stub data upload function
export const uploadStub = (stubData) => {
  return api.post("/api/stubs/upload", stubData);
};

// Example usage:
// For JSON data:
// uploadStub({name: "test", data: {}})
//   .then(response => console.log(response))
//   .catch(error => console.error(error));
//
// For file upload (FormData):
// const formData = new FormData();
// formData.append('file', fileInput.files[0]);
// formData.append('metadata', JSON.stringify({description: "Test file"}));
// uploadStub(formData).then(...);

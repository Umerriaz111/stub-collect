import notyf from "../../views/components/NotificationMessage/notyfInstance";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import {
  courierTrackingBaseURLMap,
  marketplaceBaseURLMap,
  marketplaceOrderManagementURLMap,
} from "./constants/hyperlinks";
import { handleError } from "../services/apiService";
export function getChipBgColor(label) {
  switch (label) {
    case "cheapest":
      return "#D1FCF1"; // green
    case "cheaper":
      return "#FFF3DC"; // yellow
    case "fastest":
      return "#DCEBFF"; // blue
    case "late":
      return "#FFE3E8"; //red
    default:
      return "#fff0"; //transparent
  }
}
export function getChipTextColor(label) {
  switch (label) {
    case "cheapest":
      return "#00A67C"; // green
    case "cheaper":
      return "#CA9100"; // yellow
    case "fastest":
      return "#0073C0"; // blue
    case "late":
      return "#BC203C"; //red
    default:
      return "#fff0";
  }
}

export const downloadFile = (fileUrl) => {
  const filename = fileUrl?.substring(fileUrl?.lastIndexOf("/") + 1);
  fetch(fileUrl, { mode: "no-cors" })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      notyf.success("File Downloaded Successfully");
    })
    .catch((error) => {
      console.error("Error downloading file:", error);
      handleError(error, "Something went wrong");
    });
};

export const formatDate = (dateString) => {
  if (dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  }
};

export const formatDateAndTime = (timestamp) => {
  // const timestamp = '2023-10-30T14:46:25.000000Z'
  if (timestamp && typeof timestamp === "string") {
    const isUTC = timestamp.endsWith("Z");
    const timestampParts = timestamp.replace("T", " ").split(" ");
    const datePart = timestampParts[0];
    const timePart = timestampParts[1];

    const date = new Date(isUTC ? timestamp : datePart);

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const formattedDate = date.toLocaleDateString(undefined, options);

    if (isUTC) {
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      return `${formattedDate} ${formattedTime}`;
    } else {
      const time = new Date(`1970-01-01T${timePart}`);

      const formattedTime = time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      return `${formattedDate} ${formattedTime}`;
    }
  }
  return "";
};

export const prettifyError = (error) => {
  try {
    let prettifiedError = "";

    for (const key in error) {
      if (Array.isArray(error[key])) {
        const formattedErrors = error[key].map((message) => `${message}<br>`);

        prettifiedError += `<strong>${
          key.charAt(0).toUpperCase() + key.slice(1)
        }:</strong> ${formattedErrors.join("")}`;
      } else {
        prettifiedError += `<strong>${key}:</strong> ${error[key]}<br>`;
      }
    }

    return prettifiedError;
  } catch (error) {
    return "";
  }
};

export function convertDateToLongFormat(inputDate) {
  try {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(inputDate);
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    return "";
  }
}

export function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Add 1 to month because it's 0-based
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function generateEncryptedID(id) {
  return "ZW5jcn_" + btoa(id) + "_ZGU%3D";
}

export function decryptId(id) {
  let split = id?.split("_");
  if (split) {
    try {
      let code = atob(split[1]);
      return code;
    } catch (error) {
      return "";
    }
  }
  return "";
}

export function goBack(navigate) {
  window.history?.state?.idx === 0 ? navigate() : window.history.back();
}

export function validatePhoneNumber(phoneNumber) {
  if (/^(\+)?\d{1,14}$/.test(phoneNumber)) {
    return true;
  } else {
    return false;
  }
}
// Do not remove this regex this is used in other Components
export const phoneRegExp = /^(\+1\d{10}|\d{10})$/;

export const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const fetchAppVersion = async () => {
  try {
    const response = await fetch("/version.json"); // Assuming version.json is in public folder
    const data = await response.json();
    console.log("App version:", data.version);
    return data.version;
  } catch (error) {
    console.log("Failed to fetch version:");
    return "1.0.0";
  }
};

export const formatDateMMDDYYYY = (dateString) => {
  dayjs.extend(utc);
  return dayjs.utc(dateString).format("MM/DD/YYYY");
};

export const getCourierTrackingLink = (event, order, tabValue) => {
  const shipments = order?.shipments;
  const shipment = shipments?.[0];
  const pkg = shipment?.packages?.[tabValue];
  const category = shipment?.shippingAccount?.category || order.shippingCourier;
  const trackingNumber =
    pkg?.trackingInfo?.[0]?.trackingNumber || order.trackingNumber;

  // Check if category is valid in the map and tracking number exists
  if (courierTrackingBaseURLMap[category] && trackingNumber) {
    const trackingURL = `${courierTrackingBaseURLMap[category]}${trackingNumber}`;
    window.open(trackingURL);
  }
};

export const getMarketplaceListingLink = (listingNumber, marketPlace) => {
  const baseUrl = marketplaceBaseURLMap[marketPlace];

  // Check if marketplace is valid in the map and listing number exists
  if (baseUrl && listingNumber) {
    const listingURL = `${baseUrl}${listingNumber}`;
    window.open(listingURL);
  }
};

// Custom debounce function
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const getMarketplaceOrderManagementLink = (
  orderId,
  marketPlace,
  filterStatus,
  storeName
) => {
  let baseUrl = marketplaceOrderManagementURLMap[marketPlace];

  // If Shopify, ensure storeName is provided and replace the placeholder
  if (marketPlace === "Shopify") {
    if (!storeName) {
      console.error("Shopify store name is required.");
      return;
    }
    baseUrl = baseUrl.replace("{storeName}", storeName);
  }
  // Check if marketplace is valid in the map and orderId exists
  if (baseUrl && orderId) {
    const orderURL = `${baseUrl}${orderId}${
      marketPlace === "Walmart" ? `&orderGroups=${filterStatus}` : ""
    }`;
    window.open(orderURL);
  }
};

export const hasDayPassed = (shippingDate) => {
  const now = dayjs();
  const shippingDateParsed = dayjs(shippingDate);
  const daysDifference = now.diff(shippingDateParsed, "day");

  return daysDifference > 0;
};

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const closedDays = ["Thursday"];
const openingHours = {
  dayOfWeek: daysOfWeek.filter((day) => !closedDays.includes(day)),
  opens: "09:00",
  closes: "19:00",
};

function displayTime(time: string) {
  const [hour, minute] = time.split(":");
  const numericHour = Number(hour);
  return `${numericHour % 12 || 12}:${minute} ${numericHour >= 12 ? "PM" : "AM"}`;
}

export const BusinessInfo = {
  name: "neverbe.",
  legalName: "Neverbe (Pvt) Ltd",
  addressLine1: "330/4/10 New Kandy Road",
  addressLine2: "Degoda",
  city: "Degoda",
  country: "Sri Lanka",
  phone: "070 520 8999 / 072 924 9999",
  email: "info@neverbe.lk",
  website: "www.neverbe.lk",
  openingHours,
  openingHoursLabel: `${displayTime(openingHours.opens)} – ${displayTime(openingHours.closes)}`,
  closedDaysLabel: `${closedDays.join(", ")} · Closed`,
};

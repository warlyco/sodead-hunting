import { default as dayjspkg } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjspkg.extend(relativeTime);

export const dayjs = dayjspkg;
export const formatDate = (date: string) =>
  dayjs(dayjs(date).toString()).format("M/DD/YYYY");
export const formatTime = (date: string) =>
  dayjs(dayjs(date).toString()).format("h:mm A");
export const formatDateTime = (date: string) =>
  dayjs(dayjs(date).toString()).format("M/DD/YY @ h:mm a");
export const fromNow = (date: string) => dayjs(date).fromNow();
export const diff = (date: string) => dayjs(date).diff(dayjs());
export const diffInHours = (date: string | number) =>
  dayjs().diff(dayjs(date), "hour");
export const diffInDays = (date: string | number) =>
  dayjs().diff(dayjs(date), "day");

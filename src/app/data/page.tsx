import { Metadata } from "next";
import { DataExportInterface } from "@/components/data/data-export-interface";

export const metadata: Metadata = {
  title: "Data Export - Nation-Huawei Job Fair 2025",
  description: "Export attendees data from the Nation-Huawei Job Fair 2025",
};

export default function DataExportPage() {
  return <DataExportInterface />;
}

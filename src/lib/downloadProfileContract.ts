import { apiDownload, saveBlob } from "./api";

interface DownloadOptions {
  contractUrl: string | null | undefined;
  userId: string | undefined;
  fullName: string | undefined;
  onNotify: (notification: {
    message: string;
    type: "error" | "success";
  }) => void;
}

export async function downloadProfileContract({
  contractUrl,
  userId,
  fullName,
  onNotify,
}: DownloadOptions) {
  try {
    if (!contractUrl) {
      onNotify({ message: "No contract document available", type: "error" });
      return;
    }
    if (!localStorage.getItem("token") || !userId) {
      onNotify({ message: "Authentication required", type: "error" });
      return;
    }
    onNotify({ message: "Downloading contract...", type: "success" });
    const { blob, fileName } = await apiDownload("/download-contract", {
      userId,
    });
    saveBlob(
      blob,
      fileName ||
        `${(fullName || "User").replace(/[^a-zA-Z0-9 ]/g, "_").trim()}_contract.pdf`,
    );
    onNotify({ message: "Contract downloaded successfully!", type: "success" });
  } catch (error) {
    onNotify({
      message:
        error instanceof Error ? error.message : "Failed to download contract",
      type: "error",
    });
  }
}

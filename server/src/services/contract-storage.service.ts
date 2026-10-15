// Contract files live in a private Azure Blob container and are read through
// the SDK, so only links into that container are treated as stored contracts.

const LEGACY_CLOUDINARY_ORIGIN = "https://res.cloudinary.com";

const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

/**
 * Returns the blob name when `contractUrl` points at a blob directly inside the
 * container at `containerUrl`, otherwise null. Query strings are ignored.
 */
export const resolveContractBlobName = (
  contractUrl: string,
  containerUrl: string
): string | null => {
  const contract = parseUrl(contractUrl);
  const container = parseUrl(containerUrl);
  if (!contract || !container) {
    return null;
  }

  const containerPath = container.pathname.replace(/\/+$/, "") + "/";
  if (
    contract.origin !== container.origin ||
    !contract.pathname.startsWith(containerPath)
  ) {
    return null;
  }

  let blobName: string;
  try {
    blobName = decodeURIComponent(contract.pathname.slice(containerPath.length));
  } catch {
    return null;
  }

  // Contract blobs are stored flat at the container root.
  if (!blobName || blobName.includes("/") || blobName.includes("\\")) {
    return null;
  }

  return blobName;
};

export const isLegacyCloudinaryUrl = (contractUrl: string): boolean =>
  parseUrl(contractUrl)?.origin === LEGACY_CLOUDINARY_ORIGIN;

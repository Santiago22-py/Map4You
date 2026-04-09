const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const maxImageFileBytes = 8 * 1024 * 1024;

function getFileError(file: File) {
  if (!allowedImageMimeTypes.has(file.type)) {
    return `${file.name}: solo se permiten archivos JPG, PNG o WEBP.`;
  }

  if (file.size > maxImageFileBytes) {
    return `${file.name}: el tamaño máximo por archivo es 8 MB.`;
  }

  return null;
}

export function validateImageFiles(files: File[]) {
  const validFiles: File[] = [];

  for (const file of files) {
    const fileError = getFileError(file);

    if (fileError) {
      return {
        error: fileError,
        validFiles: [],
      };
    }

    validFiles.push(file);
  }

  return {
    error: null,
    validFiles,
  };
}

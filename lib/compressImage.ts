export const compressImage = async (
  file: File,
  quality: number = 0.8,
  maxWidth: number = 1920
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize nếu ảnh quá lớn
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context error"));
            return;
          }

          // Vẽ ảnh lên canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Xuất blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Compression failed: Blob is null"));
                return;
              }
              // Tạo file mới từ blob đã nén
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            quality
          );
        } catch (e) {
          reject(e);
        }
      };

      img.onerror = (err) => reject(new Error("Image load error"));
    };

    reader.onerror = (err) => reject(new Error("File read error"));
  });
};

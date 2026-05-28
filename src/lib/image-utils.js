// src/lib/image-utils.js

/**
 * Comprime uma imagem no lado do cliente antes do upload.
 * @param {File} file O arquivo de imagem original.
 * @param {object} options Opções de compressão.
 * @param {number} options.maxWidth Largura máxima da imagem.
 * @param {number} options.maxHeight Altura máxima da imagem.
 * @param {number} options.quality Qualidade do JPEG (0 a 1).
 * @returns {Promise<File>} Uma promessa que resolve com o novo arquivo de imagem comprimido.
 */
export function compressImage(file, options = {}) {
  return new Promise((resolve, reject) => {
    const { maxWidth = 1280, maxHeight = 1280, quality = 0.8 } = options;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensiona a imagem mantendo a proporção
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Converte o canvas de volta para um arquivo
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('A conversão do canvas para Blob falhou.'));
              return;
            }
            const newFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
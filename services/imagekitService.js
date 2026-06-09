const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ''
});

const ensureImageKitConfigured = () => {
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    const error = new Error('ImageKit credentials are missing. Please configure IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.');
    error.statusCode = 500;
    throw error;
  }
};

const uploadImageToImageKit = async ({ file, fileName, folder = '/bristo/menu' }) => {
  ensureImageKitConfigured();

  return imagekit.upload({
    file,
    fileName,
    folder,
    useUniqueFileName: true,
    transformation: {
      pre: 'q-80'
    }
  });
};

module.exports = {
  uploadImageToImageKit,
  ensureImageKitConfigured
};

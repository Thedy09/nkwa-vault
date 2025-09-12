const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// Configuration du stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'african-culture-vault',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mp3', 'wav', 'ogg', 'pdf', 'doc', 'docx'],
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

// Configuration Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
    files: 10 // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Vérifier le type de fichier
    const allowedTypes = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
    };

    if (allowedTypes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non supporté: ${file.mimetype}`), false);
    }
  }
});

// Fonction pour uploader un fichier
const uploadFile = async (file, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: options.folder || 'african-culture-vault',
      resource_type: options.resource_type || 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    });

    return {
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        duration: result.duration,
        thumbnail_url: result.thumbnail_url
      }
    };
  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fonction pour supprimer un fichier
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Erreur suppression Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fonction pour générer une URL de transformation
const getTransformedUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations
  });
};

// Fonction pour générer une vignette
const getThumbnailUrl = (publicId, width = 300, height = 300) => {
  return cloudinary.url(publicId, {
    width: width,
    height: height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

// Fonction pour générer un avatar
const getAvatarUrl = (publicId, size = 200) => {
  return cloudinary.url(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

module.exports = {
  cloudinary,
  upload,
  uploadFile,
  deleteFile,
  getTransformedUrl,
  getThumbnailUrl,
  getAvatarUrl
};



import multer from "multer";
import path from "path";
import fs from "fs"
const currentDir = path.resolve("public/userImages")


/* local file delete logic image*/
export async function DeleteImgFileFromImages(currentFilePath: string) {
  const deletefilePath = path.join(currentDir, currentFilePath);

  if (fs.existsSync(deletefilePath)) {
    fs.unlink(deletefilePath, (error) => {
      if (error) {
        console.error("Error deleting image file:", error);
      } else {
        console.log("Image file deleted successfully");
      }
    });
  }
  
}

// simple multer for upload to server ./public/images
const storage = multer.diskStorage({
  destination:function (req, file, cb) {
    cb(null, "public/userImages");
  },
  filename: function (req, file, cb) {
    cb(null,`${Date.now()}${file.originalname}`);
  }
});

export const upload = multer({
  storage:storage,
  limits:{fieldSize:5 * 1024 * 1024},
  fileFilter:(req,file,cb) => {
    const fileTypes = /jpg|jpeg|png|gif|svg|SVG|JPG|JPEG|PNG|GIF/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));
    if (mimetype && extname) {
      return cb(null, true);
    }
    return cb(new Error('Proper file format to upload'));
  }
})
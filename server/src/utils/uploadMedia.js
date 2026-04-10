import Imagekit from "imagekit";

const imagekit = new Imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// console.log("ENV CHECK:", {
//     pub: process.env.IMAGEKIT_PUBLIC_KEY,
//     priv: process.env.IMAGEKIT_PRIVATE_KEY,
//     url: process.env.IMAGEKIT_URL_ENDPOINT,
// });

export const uploadToImagekit = async ({ fileBuffer, fileName, folder = "/media" }) => {
    try {
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName,
            folder,
            useUniqueFileName: true
        });

        return response;
    } catch (error) {
        console.log("ImageKit upload error", error);
        throw error
    }
}

export const deleteFromImagekit = async (fileId) => {
    try {
        const response = await imagekit.deleteFile(fileId);
        return response;
    } catch (error) {
        throw new Error("Image deletion failed");
    }
}

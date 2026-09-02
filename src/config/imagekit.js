const ImageKitSDK = require("@imagekit/nodejs");

const ImageKit =
    ImageKitSDK.default || ImageKitSDK;

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

module.exports = imagekit;
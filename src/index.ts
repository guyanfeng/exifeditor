import { ExifTool } from "exiftool-vendored";
import { promises as fs } from "fs";
import * as path from "path";

const exifTool = new ExifTool();

function randomCoordinate(base: number, variance: number): number {
    return base + (Math.random() - 0.5) * variance;
}

async function modifyExifLocation(filePath: string, latitude: number, longitude: number) {
    const variance = 0.09; // 约10公里的变化范围
    const newLatitude = randomCoordinate(latitude, variance);
    const newLongitude = randomCoordinate(longitude, variance);

    try {
        // 修改图片的地理位置
        const result = await exifTool.write(filePath, {
            GPSLatitude: newLatitude,
            GPSLongitude: newLongitude,
            GPSLatitudeRef: newLatitude >= 0 ? "N" : "S",
            GPSLongitudeRef: newLongitude >= 0 ? "E" : "W",
        }, ['-overwrite_original','-P']);

        console.log("Updated EXIF Data:", result);
    } catch (error) {
        console.error("Error modifying EXIF data:", error);
    }
}

// 替换以下路径为你的图片文件路径和指定的经纬度
const imgsDir = "imgs"; // 替换为你的图片目录路径

async function processImages() {
    try {
        const files = await fs.readdir(imgsDir);
        for (const file of files) {
            const filePath = path.join(imgsDir, file);
            await modifyExifLocation(filePath, 30.0811, 103.8567); // 例如洛杉矶的经纬度
        }
    } catch (error) {
        console.error("Error processing images:", error);
    }finally{
        await exifTool.end();
    }
}

processImages();

async function printExifCoordinates() {
    try {
        const files = await fs.readdir(imgsDir);
        for (const file of files) {
            const filePath = path.join(imgsDir, file);
            const exifData = await exifTool.read(filePath);
            const latitude = exifData?.GPSLatitude;
            const longitude = exifData?.GPSLongitude;
            console.log(`File: ${file}, Latitude: ${latitude}, Longitude: ${longitude}`);
        }
    } catch (error) {
        console.error("Error printing EXIF coordinates:", error);
    }
    finally{
        await exifTool.end();
    }
}

// printExifCoordinates();
import { exec, execSync, spawn, spawnSync } from 'child_process';
import express, { Express, Request, Response } from 'express';
import QRCode from 'qrcode';
import { PassThrough } from 'stream';

const app: Express = express();
const port = 3000;

app.get('/', async (req: Request, res: Response) => {

    var ipAddress = "0.0.0.0";
    const ipconfig = execSync("ipconfig");
    const output = ipconfig.toString();
    var lanjut: boolean = false;
    const arrResult = output.split(/\r?\n/);
    for (let i = 0; i < arrResult.length; i++) {
        const element = arrResult[i];
        if (element.includes("Wireless LAN adapter Wi-Fi")) {
            lanjut = true;
        }

        if (lanjut == false) {
            continue;
        }

        if (element.includes("IPv4 Address")) {
            const arr = element.split(":");
            ipAddress = arr[1].trim();
        }
    }

    try {
        console.log(`http://${ipAddress}:3000/connect`);

        const qrStream = new PassThrough();
        const result = await QRCode.toFileStream(qrStream, `http://${ipAddress}:3000/connect`, {
            type: 'png',
            width: 200,
            errorCorrectionLevel: 'H'
        });

        qrStream.pipe(res);
    } catch (error) {
        return res.status(200).send("OK");
    }
});

app.get("/connect", (req: Request, res: Response) => {
    const clientIp = req.socket.remoteAddress?.replace("::ffff:", "");
    console.log(clientIp);
    const adb = "\\Users\\user\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe";

    const a = execSync(`${adb} tcpip 5555`);
    console.log(a.toString());

    const b = execSync(`${adb} connect ${clientIp}`);
    console.log(b.toString());

    res.send(req.socket.remoteAddress?.replace("::ffff:", ""));
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
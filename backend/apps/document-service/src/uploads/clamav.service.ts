
import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import * as net from 'node:net';

@Injectable()

export class ClamavService {

  scan(buffer: Buffer): Promise<string> {

    return new Promise((resolve, reject) => {

      const socket = net.createConnection(

        Number(process.env.CLAMAV_PORT || 3310),

        process.env.CLAMAV_HOST || '127.0.0.1',

      );

      let response = '';

      socket.setTimeout(60000);

      socket.on('connect', () => {

        socket.write('zINSTREAM\0');

        const chunkSize = 1024 * 1024;

        for (let offset = 0; offset < buffer.length; offset += chunkSize) {

          const chunk = buffer.subarray(offset, offset + chunkSize);

          const length = Buffer.alloc(4);

          length.writeUInt32BE(chunk.length, 0);

          socket.write(length);

          socket.write(chunk);

        }

        socket.write(Buffer.alloc(4));

      });

      socket.on('data', (data) => {

        response += data.toString();

        if (response.includes('OK')) {

          socket.destroy();

          resolve('CLEAN');

        } else if (response.includes('FOUND')) {

          socket.destroy();

          resolve('INFECTED');

        } else if (response.includes('ERROR')) {

          socket.destroy();

          reject(new ServiceUnavailableException(`ClamAV scan error: ${response}`));

        }

      });

      socket.on('timeout', () => {

        socket.destroy();

        reject(new ServiceUnavailableException('ClamAV scan timed out'));

      });

      socket.on('error', (error) =>

        reject(new ServiceUnavailableException(`ClamAV unavailable: ${error.message}`)),

      );

    });

  }

}


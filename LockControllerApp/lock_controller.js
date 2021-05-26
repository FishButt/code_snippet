import type { Address, Command } from '../types';
import net from 'net';
import SerialPort from 'serialport';
import logger from '../logger';
import { getOpenData, getStatusData } from './commands';
import { responseOk } from '../dto';

export type Props = { address?: string, port?: number, serialPath?: string };

const TIMEOUT = 500;
const { ByteLength } = SerialPort.parsers;

export default class Controller {
  address: string;
  port: number;
  serialPath: string;
  isSerial: boolean;

  constructor({ address, port, serialPath }: Props) {
    if (!address && !port && !serialPath) {
      throw new Error('Controller need some arguments!');
    }
    this.isSerial = !!serialPath;
    this.address = address || '';
    this.port = port || NaN;
    this.serialPath = serialPath || '';
  }

  doSerialRequest(data: Command): Promise<Buffer> {
    const sp = new SerialPort(this.serialPath, { baudRate: 19200 });

    return new Promise((resolve, reject) => {
      const lp = sp.pipe(new ByteLength({ length: 8 }), { end: true });

      sp.write(Buffer.from(data), () => {
        logger.info('Lock should be opened.');
      });

      sp.on('error', (e: Error) => {
        logger.error(`onSerialError ${e.toString()}`);
        reject(e);
      });

      lp.on('data', (d: Buffer) => {
        logger.info(`Received data: ${JSON.stringify(responseOk(d))}`);
        resolve(d);
      });

      setTimeout(
        () => reject(new Error('Serial connection timedout')),
        TIMEOUT
      );
    })
      .then((d: Buffer) => {
        logger.info(`SerialThen ${JSON.stringify(responseOk(d))}`);
        sp.close();
        return d;
      })
      .catch((e: Error) => {
        logger.error(`SerialCatch: ${e.toString()}`);
        sp.close();
        return e;
      });
  }

  doNetRequest(data: Command): Promise<Buffer> {
    const client = new net.Socket();

    return new Promise((resolve, reject) => {
      client.on('data', (d: Buffer) => {
        logger.debug('DATA:', d);
        resolve(d);
      });

      client.on('error', (e: Error) => {
        const msg = e.message;
        logger.debug(msg);
        reject(e);
      });

      client.connect(this.port, this.address, () => {
        logger.info('Started socket client.');
        client.write(Buffer.from(data), () => {
          logger.info('Command sent.');
        });
      });

      client.setTimeout(TIMEOUT, () => resolve());
    })
      .then((d: Buffer) => {
        logger.info('Closing socket [OK]');
        client.destroy();
        return d;
      })
      .catch((e: Error) => {
        logger.info(`Closing socket [Err: ${e.message}]`);
        client.destroy();
      });
  }

  doRequest(data: Command): Promise<Buffer> {
    return this.isSerial ? this.doSerialRequest(data) : this.doNetRequest(data);
  }

  open = (id: Address): Promise<Buffer> => this.doRequest(getOpenData(id));

  status = (id: Address): Promise<Buffer> => this.doRequest(getStatusData(id));
}

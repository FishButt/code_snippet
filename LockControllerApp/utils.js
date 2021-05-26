import type { Address, Cmd, Command, Start, End } from '../types';

export const addresses: Array<Address> = [
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c,
  0x0d, 0x0e, 0x0f,
];

const STX: Start = 0x02;
const ETX: End = 0x03;
const CMD: Cmd = 0x31;

const checksum = (data: Command): number => data.reduce((a, v) => a + v) % 256;

export const getOpenData = (id: Address): Command => {
  const data = [STX, addresses[id], CMD, ETX];
  return [...data, checksum(data)];
};

export const getStatusData = (id: Address): Command => {
  const data = [STX, addresses[id], 0x30, ETX];
  return [...data, checksum(data)];
};

import realPresensiRecords from './realPresensiRecords.json';
import realLocations from './realLocations.json';
import realTeachers from './realTeachers.json';
import { WilayahInfo, LokasiInfo, SesiMengajarRecord } from '../types';

export const WILAYAH_DATA: WilayahInfo = {
  kodeWilayah: 'WIL-BKS-PLUS',
  namaWilayah: 'Wilayah Bekasi Plus',
  kepalaWilayah: 'Murtiyo',
  email: 'wilayahbekasiplus@gmail.com',
  lokasiList: realLocations.map((l) => l.kodeLokasi)
};

export const LOKASI_DATA: LokasiInfo[] = realLocations;

export const TEACHERS_LIST = realTeachers;

export const INITIAL_SESI_RECORDS: SesiMengajarRecord[] = realPresensiRecords as SesiMengajarRecord[];

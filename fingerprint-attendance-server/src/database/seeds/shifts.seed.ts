import { DataSource } from 'typeorm';
import { Shift } from '../entities/shift.entity';

export class ShiftsSeed {
  async run(dataSource: DataSource): Promise<void> {
    const shiftRepository = dataSource.getRepository(Shift);

    const shifts = [
      {
        nama: 'Shift Pagi',
        jam_masuk: '08:00',
        jam_pulang: '16:00',
        toleransi_terlambat: 15,
        hari_kerja: [1, 2, 3, 4, 5], // Senin - Jumat
      },
      {
        nama: 'Shift Siang',
        jam_masuk: '14:00',
        jam_pulang: '22:00',
        toleransi_terlambat: 15,
        hari_kerja: [1, 2, 3, 4, 5],
      },
      {
        nama: 'Shift Malam',
        jam_masuk: '22:00',
        jam_pulang: '06:00',
        toleransi_terlambat: 15,
        hari_kerja: [1, 2, 3, 4, 5],
      },
    ];

    for (const shiftData of shifts) {
      const existing = await shiftRepository.findOneBy({
        nama: shiftData.nama,
      });
      if (!existing) {
        const shift = shiftRepository.create(shiftData);
        await shiftRepository.save(shift);
        console.log(`Created shift: ${shift.nama}`);
      } else {
        console.log(`Shift ${shiftData.nama} already exists`);
      }
    }
  }
}

import assert from 'node:assert';
import { parseReceipt } from '../src/utils/receiptParser.js';

const WOK = [
  'WOK NUSANTARA',
  'Jl. Kiai Morang Timur No 54',
  'Penggaron Kidul, Semarang',
  '27/08/2020 20:45',
  'No. 259184820280827204627',
  'Nasi Ayam Asam Manis ( PEDAS )',
  '1 22.000 22.000',
  'Nasi goreng Seafood ( SEDANG )',
  '1 20.000 20.000',
  'Nasi goreng Ayam ( TIDAK PEDAS )',
  '1 17.000 17.000',
  'Mi goreng Seafood ( TIDAK PEDAS )',
  '1 20.000 20.000',
  'Mie goreng ayam ( TIDAK PEDAS )',
  '1 17.000 17.000',
  'Kwetiau goreng Ayam ( CABE PISAH )',
  '1 17.000 17.000',
  'Fuyunghai',
  '1 20.000 20.000',
  'Nasi goreng Spesial ( PEDAS )',
  '1 18.000 18.000',
  'Subtotal 151.000',
  'Service Charge 12.080',
  'PPN 10% 16.308',
  'TOTAL 179.388',
  'TUNAI 250.000',
  'KEMBALI 46.720',
  'Terima kasih atas kunjungan anda',
];

const wok = parseReceipt(WOK);

assert.strictEqual(wok.merchant, 'WOK NUSANTARA', 'merchant salah');
assert.strictEqual(wok.transactionDate, '2020-08-27', 'tanggal salah');
assert.strictEqual(wok.items.length, 8, `item harus 8, dapat ${wok.items.length}`);

const sum = wok.items.reduce((t, i) => t + i.amount, 0);
assert.strictEqual(sum, 151000, `total item harus 151000, dapat ${sum}`);

assert.ok(
  wok.items.some((i) => i.name.startsWith('Fuyunghai') && i.amount === 20000),
  'item Fuyunghai tidak terbaca'
);

// Baris total / tunai / ppn tidak boleh jadi item.
for (const bad of ['total', 'tunai', 'kembali', 'ppn', 'service', 'subtotal']) {
  assert.ok(
    !wok.items.some((i) => i.name.toLowerCase().startsWith(bad)),
    `baris "${bad}" bocor jadi item`
  );
}

// Harga nempel di nama item, satu baris.
const inline = parseReceipt([
  'WARUNG SEDERHANA',
  '02-03-2026',
  'Nasi Goreng Spesial 25.000',
  'Es Teh Manis Rp 5.000',
  'TOTAL 30.000',
]);
assert.strictEqual(inline.items.length, 2, 'item inline harus 2');
assert.strictEqual(inline.items[0].amount, 25000);
assert.strictEqual(inline.items[1].amount, 5000);
assert.strictEqual(inline.transactionDate, '2026-03-02');

// Nama item kepanjangan, turun ke baris berikutnya.
const multiline = parseReceipt([
  'TOKO MAKMUR',
  'Nasi Ayam Bakar',
  'Sambal Matah',
  '1 2 x 18.000 36.000',
  'TOTAL 36.000',
]);
assert.strictEqual(multiline.items.length, 1, 'item multiline harus 1');
assert.strictEqual(multiline.items[0].amount, 36000);
assert.ok(
  multiline.items[0].name.includes('Nasi Ayam Bakar') &&
    multiline.items[0].name.includes('Sambal Matah'),
  `nama multiline salah: ${multiline.items[0].name}`
);

// Format angka lain.
const formats = parseReceipt([
  'TOKO ANGKA',
  'Barang A 22,000',
  'Barang B 22.000,00',
  'Barang C 22000',
  'Barang D 22.000,-',
]);
assert.deepStrictEqual(
  formats.items.map((i) => i.amount),
  [22000, 22000, 22000, 22000],
  'normalisasi angka salah'
);

// Header toko (alamat & kontak) tidak boleh jadi item, dan tidak boleh
// menempel ke nama item pertama.
const withHeader = parseReceipt([
  'WARUNG BAROKAH',
  'Jl. Raya Darmo No. 12',
  'RT 04 / RW 07, Kel. Sawunggaling',
  'Kec. Wonokromo, Kota Surabaya',
  'Telp. 031-5678901  WA 0812-3456-7890',
  'instagram @warungbarokah',
  '05/04/2026 19:12',
  'Nasi Rames 15.000',
  'Es Jeruk 5.000',
  'TOTAL 20.000',
]);
assert.deepStrictEqual(
  withHeader.items.map((i) => i.name),
  ['Nasi Rames', 'Es Jeruk'],
  `header bocor jadi item: ${JSON.stringify(withHeader.items.map((i) => i.name))}`
);

// Struk Indomaret asli: baris kontak "TELP 1500280" pernah terbaca jadi item
// Rp1.500.280, dan baris NPWP/alamat ikut terbaca.
const INDOMARET = [
  'KI FINDoMARCi',
  'RATIS ONGKIt1 JAM SAMPAL',
  'pDOMARCOPiRISMATAMA',
  'EOUMG MENARA',
  'NDCMARET BOULEVARD',
  'PANTA NDAH KAPUK',
  'JAKARTAUTARA',
  'NPWE 0013379946-092 000',
  'VAL ISONGO KM.11',
  'JL, WALISONGO KH 11, KEL. TAMBAK AJI',
  'KEC. NGALIYAN KOTA SMARANG, 50185',
  '9ndsmve',
  '10.11.26-07:22/4.6.0/TNHI-1445/FAIZK/02',
  'LE MINERALE 600 ML',
  '1 4200',
  'PPN',
  'HARGA JUAL : 3,784',
  'TOTAL BELAN JA :4,200',
  ': DPP= 3,468 PPN: 416',
  '4,200',
  'TUNAI : 11,000',
  'KEMBALI : 6,800',
  'LAYANAN KONSUMEN',
  'SMSWA 0811.1600.280 TELP 1500280',
  'KONTAK@INDOMARET.CO.ID',
  'BELANJA LEBIH MUDAH DI',
  'KI IKINDOMARET',
];
const indomaret = parseReceipt(INDOMARET);
assert.strictEqual(
  indomaret.items.length,
  1,
  `struk Indomaret harus 1 item, dapat ${JSON.stringify(indomaret.items)}`
);
assert.strictEqual(indomaret.items[0].name, 'LE MINERALE 600 ML');
assert.strictEqual(indomaret.items[0].amount, 4200);
assert.strictEqual(indomaret.transactionDate, '2026-11-10');

console.log('OK  merchant:', wok.merchant);
console.log('OK  tanggal :', wok.transactionDate);
console.log('OK  item    :', wok.items.length, '| total', sum);
console.log('OK  semua assertion lolos');

document.addEventListener('DOMContentLoaded', function () {
  // Municipalities (SAMELCO II – Samar) with barangays

  var municipalities = [
    { name: 'Almagro', lat: 11.9167, lng: 124.2833, barangays: ['Bacjao', 'Biasong I', 'Biasong II', 'Costa Rica', 'Costa Rica II', 'Guin-ansan', 'Imelda', 'Kerikite', 'Lunang I', 'Lunang II', 'Mabuhay', 'Magsaysay', 'Malobago', 'Marasbaras', 'Panjobjoban I', 'Panjobjoban II', 'Poblacion', 'Roño', 'San Isidro', 'San Jose', 'Talahid', 'Tonga-tonga', 'Veloso'] },
    { name: 'Basey', lat: 11.2833, lng: 125.0667, barangays: ['Amandayehan', 'Anglit', 'Bacubac', 'Balante', 'Baloog', 'Basiao', 'Baybay', 'Binongtu-an', 'Buenavista', 'Bulao', 'Burgos', 'Buscada', 'Cambayan', 'Can-abay', 'Cancaiyas', 'Canmanila', 'Catadman', 'Cogon', 'Del Pilar', 'Dolongan', 'Guintigui-an', 'Guirang', 'Iba', 'Inuntan', 'Lawa-an', 'Loog', 'Loyo', 'Mabini', 'Magallanes', 'Manlilinab', 'May-it', 'Mercado', 'Mongabong', 'New San Agustin', 'Nouvelas Occidental', 'Old San Agustin', 'Palaypay', 'Panugmonon', 'Pelit', 'Roxas', 'Salvacion', 'San Antonio', 'San Fernando', 'Sawa', 'Serum', 'Sugca', 'Sugponon', 'Sulod', 'Tinaogan', 'Tingib', 'Villa Aurora'] },
    { name: 'Calbayog City', lat: 12.0672, lng: 124.5972, barangays: ['Acedillo', 'Aguit-itan', 'Alibaba', 'Amampacang', 'Anislag', 'Awang East', 'Awang West', 'Ba-ay', 'Bagacay', 'Bagong Lipunan', 'Bantayan', 'Bantayan (Pob.)', 'Barcelona', 'Bariao', 'Binaliw', 'Burgos', 'Cabalogan', 'Cabunga-an', 'Cag-anahaw', 'Cagbanay', 'Cagbobong', 'Caglanipa', 'Calero', 'Capacuhan', 'Carayman', 'Carmen', 'Casaan', 'Cogon', 'Dawel', 'Dawes', 'Diotay', 'Dolores', 'Erenas', 'Espinosa', 'Gadgaran', 'Gasdo', 'Geraga-an', 'Guadalupe', 'Guyam', 'Hibatang', 'Hobong', 'Himamawi', 'Japay', 'Jose A. Roño', 'Kalilihan', 'La Paz', 'Laguna', 'Lalong', 'Lapaan', 'Libertad', 'Lobrigo', 'Longsob', 'Loyo', 'Lugo', 'Mabini', 'Macatingog', 'Mag-ubay', 'Magbay', 'Malaga', 'Malajog', 'Malopalo', 'Mantaong', 'Mantang', 'Matobato', 'Maybog', 'Maypangdan', 'Mendoza', 'Mongol Buntay', 'Naga', 'Naguma', 'Nalibunan', 'Nipa', 'Obrero', 'Olera', 'Omaganhan', 'Osmeña', 'Palanas', 'Palanyogan', 'Palta', 'Pangdan', 'Panlayahan', 'Panonongan', 'Panoypoy', 'Patong', 'Payahan', 'Poblacion 1', 'Poblacion 2', 'Poblacion 3', 'Poblacion 4', 'Poblacion 5', 'Poblacion 6', 'Poblacion 7', 'Poblacion 8', 'Poblacion 9', 'Poblacion 10', 'Poblacion 11', 'Poblacion 12', 'Poblacion 13', 'Poblacion 14', 'Poblacion 15', 'Poblacion 16', 'Poblacion 17', 'Poblacion 18', 'Poblacion 19', 'Poblacion 20', 'Poblacion 21', 'Poblacion 22', 'Poblacion 23', 'Ragay', 'Rizal', 'Sabang', 'Saljagon', 'San Policarpo', 'San Rufino', 'Sansanan', 'Santo Niño', 'Sugod', 'Suluan', 'Tabawan', 'Talalora', 'Talisayan', 'Tarangnan', 'Tinambacan Norte', 'Tinambacan Sur', 'Trinidad', 'Villahermosa', 'Wright'] },
    { name: 'Calbiga', lat: 11.6167, lng: 125.0167, barangays: ['Antol', 'Bacyaran', 'Barayong', 'Barobo', 'Binongtu-an', 'Boruya', 'Bulao', 'Burabod', 'Caamlongan', 'Calbiga (Pob.)', 'Canbagtic', 'Canticum', 'Daligan', 'Guimbanga', 'Hilabangan', 'Hubasan', 'Literon', 'Lungib', 'Macaalan', 'Malabal', 'Mantang', 'Maybocog', 'Minata', 'Obeño', 'Panalaron', 'Panaytay', 'Patag', 'Polangi', 'Rawis', 'Rizal', 'San Miguel', 'Sinalaban', 'Tabo', 'Tarangnan', 'Timbangan', 'Ubo', 'Villa Aurora', 'Waray', 'Zumarraga'] },
    { name: 'Catbalogan City', lat: 11.7792, lng: 124.8842, barangays: ['Albalate', 'Bagumbayan', 'Bangon', 'Basiao', 'Buran', 'Cabugawan', 'Cagudalo', 'Cagulanao', 'Cahumpan', 'Calbiga', 'Canlapwas', 'Cogon', 'Daram', 'Dawel', 'Dolores', 'Guindapunan', 'Ibol', 'Iguid', 'Lagundi', 'Libas', 'Lobo', 'Mabini', 'Macatoon', 'Magasbis', 'Malajog', 'Mantang', 'Mombon', 'Muñoz', 'Palanyogon', 'Payao', 'Poblacion 1', 'Poblacion 2', 'Poblacion 3', 'Poblacion 4', 'Poblacion 5', 'Poblacion 6', 'Poblacion 7', 'Poblacion 8', 'Poblacion 9', 'Poblacion 10', 'Rizal', 'Salud', 'San Andres', 'San Pablo', 'San Roque', 'Santo Niño', 'Silanga', 'Sohoton', 'Talisay', 'Tigbawon', 'Vigan', 'Villa Perfecta', 'New Mahayag', 'Old Mahayag', 'Rama', 'San Vicente'] },
    { name: 'Daram', lat: 11.6333, lng: 124.7833, barangays: ['Poblacion 1 (Hilaba)', 'Poblacion 2 (Malingon)', 'Poblacion 3 (Canti-il)', 'Arawane', 'Astorga', 'Bachao', 'Baclayan', 'Bagacay', 'Bayog', 'Betaug', 'Birawan', 'Bono-anon', 'Buenavista', 'Burgos', 'Cabac', 'Cabil-isan', 'Cabiton-an', 'Cabugao', 'Cagboboto', 'Calawan-an', 'Cambuhay', 'Candugue', 'Campelipa', 'Canloloy', 'Cansaganay', 'Casab-ahan', 'Guindapunan', 'Guintampilan', 'Iquiran', 'Jacopon', 'Losa', 'Lucob-lucob', 'Mabini', 'Macalpe', 'Mandoyucan', 'Marupangdan', 'Mayabay', 'Mongolbongol', 'Nipa', 'Parasan', 'Pondang', 'Poso', 'Real', 'Rizal', 'San Antonio', 'San Jose', 'San Miguel', 'San Roque', 'San Vicente', 'Saugan', 'So-ong', 'Sua', 'Sugod', 'Talisay', 'Tugas', 'Ubo', 'Valles-Bello', 'Yangta'] },
    { name: 'Gandara', lat: 12.0167, lng: 124.8167, barangays: ['Adela', 'Bacao', 'Balocawe', 'Bangon', 'Bantayan', 'Burabod', 'Cabatuan', 'Cagutsan', 'Cahumpan', 'Calayan', 'Canhumawid', 'Caparangasan', 'Casab-ahan', 'Daram', 'Felipe', 'Gandara (Pob.)', 'Geraca', 'Gutusan', 'Hernani', 'Hinayagan', 'Hinirangan', 'Jabong', 'Jalacutan', 'Lungib', 'Macugo', 'Malino', 'Marupangdan', 'Mataluto', 'Matobato', 'Maybocog', 'Minata', 'Nabong', 'Nalibunan', 'Obeño', 'Panalaron', 'Panaytay', 'Patag', 'Polangi', 'Rawis', 'Rizal', 'San Miguel', 'Sinalaban', 'Tabo', 'Tarangnan', 'Timbangan', 'Ubo', 'Villa Aurora', 'Waray', 'Zumarraga', 'Adlawon', 'Balud', 'Bantigue', 'Bunga', 'Cagmanaba', 'Calbayog', 'Canlisay', 'Dapdap', 'Ginablan', 'Hinabangan', 'Lungsod', 'Mabuhay', 'Magtaon', 'Malobago', 'Napalisan', 'Palale', 'San Isidro', 'San Jose', 'Santo Niño', 'Talisay'] },
    { name: 'Hinabangan', lat: 11.6833, lng: 125.0833, barangays: ['Bagacay', 'Canacap', 'Carmen', 'Catubig', 'Daram', 'Hinabangan (Pob.)', 'Laygayon', 'Magtangale', 'Malatugawi', 'Pagbabangnan', 'Panitian', 'Rizal', 'San Jose', 'San Juan', 'San Pablo', 'San Vicente', 'Sitio Daku', 'Talahid', 'Ubo', 'Villa Aurora', 'Bagong Silang'] },
    { name: 'Jiabong', lat: 11.7667, lng: 124.9500, barangays: ['Bactong', 'Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Bugho', 'Camantang', 'Candayona', 'Dapdap', 'Dumara', 'Dungca', 'Garcia', 'Guindapunan', 'Hilabangan', 'Jiabong', 'Lungib', 'Malino', 'Mantang', 'Marupangdan', 'Maybocog', 'Minata', 'Nalibunan', 'Obeño', 'Panalaron', 'Patag', 'Polangi', 'Rawis', 'Rizal', 'San Miguel', 'Sinalaban', 'Tabo', 'Tarangnan'] },
    { name: 'Marabut', lat: 11.1167, lng: 125.2167, barangays: ['Binukyahan', 'Calumpang', 'Canyoyo', 'Catagbacan', 'Dapdap', 'Daro', 'Lalagsan', 'Lipata', 'Marabut (Pob.)', 'Mati', 'Napalisan', 'Osmeña', 'Pili', 'Pinamitinan', 'Rizal', 'San Roque', 'Santo Niño', 'Sawang', 'Sogod', 'Tagalag', 'Talisay', 'Tinabanan', 'Villa Aurora', 'Calapi'] },
    { name: 'Matuguinao', lat: 12.1333, lng: 124.8833, barangays: ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12', 'Barangay 13', 'Barangay 14', 'Barangay 15', 'Barangay 16', 'Barangay 17', 'Barangay 18', 'Barangay 19', 'Barangay 20'] },
    { name: 'Motiong', lat: 11.7782, lng: 124.9986, barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Barangay 13 (Pob.)', 'Barangay 14 (Pob.)', 'Barangay 15 (Pob.)', 'Barangay 16 (Pob.)', 'Barangay 17 (Pob.)', 'Barangay 18 (Pob.)', 'Barangay 19 (Pob.)', 'Barangay 20 (Pob.)', 'Barangay 21 (Pob.)', 'Barangay 22 (Pob.)', 'Barangay 23 (Pob.)', 'Barangay 24 (Pob.)', 'Barangay 25 (Pob.)', 'Barangay 26 (Pob.)', 'Barangay 27 (Pob.)', 'Barangay 28 (Pob.)', 'Barangay 29 (Pob.)', 'Barangay 30 (Pob.)'] },
    { name: 'Paranas (Wright)', lat: 11.7715, lng: 125.0225, barangays: [
      { name: 'Anagasi', lat: 11.80, lng: 125.05 },
      { name: 'Apolonia', lat: 11.78, lng: 125.08 },
      { name: 'Bagsa', lat: 11.79, lng: 125.04 },
      { name: 'Balbagan', lat: 11.75, lng: 125.06 },
      { name: 'Bato', lat: 11.77, lng: 125.03 },
      { name: 'Buray', lat: 11.7753, lng: 125.0387 },
      { name: 'Cantaguic', lat: 11.73, lng: 125.08 },
      { name: 'Cantao-an', lat: 11.79, lng: 125.05 },
      { name: 'Cantato', lat: 11.76, lng: 125.07 },
      { name: 'Casandig I', lat: 11.74, lng: 125.04 },
      { name: 'Casandig II', lat: 11.74, lng: 125.05 },
      { name: 'Cawayan', lat: 11.7931, lng: 125.0318 },
      { name: 'Concepcion', lat: 11.72, lng: 125.09 },
      { name: 'Jose Roño', lat: 11.71, lng: 125.10 },
      { name: 'Lawaan I', lat: 11.70, lng: 125.11 },
      { name: 'Lawaan II', lat: 11.70, lng: 125.12 },
      { name: 'Lipata', lat: 11.788, lng: 125.016 },
      { name: 'Lokilok n', lat: 11.69, lng: 125.13 },
      { name: 'Mangcal', lat: 11.78, lng: 125.02 },
      { name: 'Maylobe', lat: 11.72, lng: 125.10 },
      { name: 'Minarog', lat: 11.79, lng: 125.02 },
      { name: 'Nawi', lat: 11.71, lng: 125.11 },
      { name: 'Pabanog', lat: 11.76, lng: 125.01 },
      { name: 'Paco', lat: 11.75, lng: 125.02 },
      { name: 'Pagsa-ogan', lat: 11.73, lng: 125.03 },
      { name: 'Pagsanjan', lat: 11.72, lng: 125.04 },
      { name: 'Patag', lat: 11.71, lng: 125.05 },
      { name: 'Pequit', lat: 11.80, lng: 125.03 },
      { name: 'Poblacion 1', lat: 11.77, lng: 125.02 },
      { name: 'Poblacion 2', lat: 11.77, lng: 125.02 },
      { name: 'Poblacion 3', lat: 11.77, lng: 125.02 },
      { name: 'Poblacion 4', lat: 11.77, lng: 125.02 },
      { name: 'Poblacion 5', lat: 11.77, lng: 125.02 },
      { name: 'Poblacion 6', lat: 11.77, lng: 125.02 },
      { name: 'Salay', lat: 11.78, lng: 125.07 },
      { name: 'San Isidro', lat: 11.70, lng: 125.06 },
      { name: 'Santo Niño', lat: 11.69, lng: 125.07 },
      { name: 'Sulopan', lat: 11.68, lng: 125.08 },
      { name: 'Tabucan', lat: 11.67, lng: 125.09 },
      { name: 'Tapul', lat: 11.66, lng: 125.10 },
      { name: 'Tenani', lat: 11.65, lng: 125.11 },
      { name: 'Tigbawon', lat: 11.76, lng: 125.00 },
      { name: 'Tula', lat: 11.64, lng: 125.12 },
      { name: 'Tutubigan', lat: 11.63, lng: 125.13 },
    ] },
    { name: 'Pinabacdao', lat: 11.6167, lng: 124.9833, barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Barangay 13 (Pob.)', 'Barangay 14 (Pob.)', 'Barangay 15 (Pob.)', 'Barangay 16 (Pob.)', 'Barangay 17 (Pob.)', 'Barangay 18 (Pob.)', 'Barangay 19 (Pob.)', 'Barangay 20 (Pob.)', 'Barangay 21 (Pob.)', 'Barangay 22 (Pob.)', 'Barangay 23 (Pob.)', 'Barangay 24 (Pob.)'] },
    { name: 'San Jorge', lat: 11.3000, lng: 125.0833, barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Barangay 13 (Pob.)', 'Barangay 14 (Pob.)', 'Barangay 15 (Pob.)', 'Barangay 16 (Pob.)', 'Barangay 17 (Pob.)', 'Barangay 18 (Pob.)', 'Barangay 19 (Pob.)', 'Barangay 20 (Pob.)', 'Barangay 21 (Pob.)', 'Barangay 22 (Pob.)', 'Barangay 23 (Pob.)', 'Barangay 24 (Pob.)', 'Barangay 25 (Pob.)', 'Barangay 26 (Pob.)', 'Barangay 27 (Pob.)', 'Barangay 28 (Pob.)', 'Barangay 29 (Pob.)', 'Barangay 30 (Pob.)', 'Barangay 31 (Pob.)', 'Barangay 32 (Pob.)', 'Barangay 33 (Pob.)', 'Barangay 34 (Pob.)', 'Barangay 35 (Pob.)', 'Barangay 36 (Pob.)', 'Barangay 37 (Pob.)', 'Barangay 38 (Pob.)', 'Barangay 39 (Pob.)', 'Barangay 40 (Pob.)', 'Barangay 41 (Pob.)'] },
    { name: 'San Jose de Buan', lat: 12.0500, lng: 125.0333, barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Barangay 13 (Pob.)', 'Barangay 14 (Pob.)'] },
    { name: 'San Sebastian', lat: 11.7000, lng: 125.0167, barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Barangay 13 (Pob.)', 'Barangay 14 (Pob.)', 'Barangay 15 (Pob.)', 'Barangay 16 (Pob.)', 'Barangay 17 (Pob.)', 'Barangay 18 (Pob.)', 'Barangay 19 (Pob.)', 'Barangay 20 (Pob.)'] },
    { name: 'Santa Rita', lat: 11.4500, lng: 124.9333, barangays: ['Anibong', 'Aslum', 'Bagolibas', 'Balud', 'Bantigue', 'Bunga', 'Cagmanaba', 'Calbayog', 'Canlisay', 'Dapdap', 'Ginablan', 'Hinabangan', 'Lungsod', 'Mabuhay', 'Magtaon', 'Malobago', 'Napalisan', 'Palale', 'Santa Rita (Pob.)', 'San Isidro', 'San Jose', 'Santo Niño', 'Talisay', 'Villa Aurora', 'Bagacay', 'Burabod', 'Cabatuan', 'Cagutsan', 'Calayan', 'Canhumawid', 'Caparangasan', 'Casab-ahan', 'Felipe', 'Geraca', 'Gutusan', 'Hernani', 'Hinayagan', 'Hinirangan', 'Jabong', 'Jalacutan', 'Macugo', 'Malino', 'Marupangdan', 'Mataluto', 'Matobato'] },
    { name: 'Santo Niño', lat: 11.9833, lng: 124.4667, barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Barangay 13 (Pob.)', 'Barangay 14 (Pob.)', 'Barangay 15 (Pob.)', 'Barangay 16 (Pob.)', 'Barangay 17 (Pob.)', 'Barangay 18 (Pob.)', 'Barangay 19 (Pob.)', 'Barangay 20 (Pob.)'] },
    { name: 'Tagapul-an', lat: 11.9500, lng: 124.8333, barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Barangay 13 (Pob.)', 'Barangay 14 (Pob.)', 'Barangay 15 (Pob.)'] },
    { name: 'Talalora', lat: 11.5333, lng: 124.8333, barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Barangay 13 (Pob.)', 'Barangay 14 (Pob.)', 'Barangay 15 (Pob.)'] },
    { name: 'Tarangnan', lat: 11.9000, lng: 124.7500, barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Barangay 13 (Pob.)', 'Barangay 14 (Pob.)', 'Barangay 15 (Pob.)', 'Barangay 16 (Pob.)', 'Barangay 17 (Pob.)', 'Barangay 18 (Pob.)', 'Barangay 19 (Pob.)', 'Barangay 20 (Pob.)', 'Barangay 21 (Pob.)', 'Barangay 22 (Pob.)', 'Barangay 23 (Pob.)', 'Barangay 24 (Pob.)'] },
    { name: 'Villareal', lat: 11.5667, lng: 124.9333, barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Barangay 13 (Pob.)', 'Barangay 14 (Pob.)', 'Barangay 15 (Pob.)', 'Barangay 16 (Pob.)', 'Barangay 17 (Pob.)', 'Barangay 18 (Pob.)', 'Barangay 19 (Pob.)', 'Barangay 20 (Pob.)'] },
    { name: 'Zumarraga', lat: 11.6333, lng: 124.8500, barangays: ['Barangay 1 (Pob.)', 'Barangay 2 (Pob.)', 'Barangay 3 (Pob.)', 'Barangay 4 (Pob.)', 'Barangay 5 (Pob.)', 'Barangay 6 (Pob.)', 'Barangay 7 (Pob.)', 'Barangay 8 (Pob.)', 'Barangay 9 (Pob.)', 'Barangay 10 (Pob.)', 'Barangay 11 (Pob.)', 'Barangay 12 (Pob.)', 'Barangay 13 (Pob.)', 'Barangay 14 (Pob.)', 'Barangay 15 (Pob.)', 'Barangay 16 (Pob.)', 'Barangay 17 (Pob.)', 'Barangay 18 (Pob.)', 'Barangay 19 (Pob.)', 'Barangay 20 (Pob.)'] }
  ];
  var municipalityDataset = Array.isArray(window.SAMELCO_MUNICIPALITIES) && window.SAMELCO_MUNICIPALITIES.length
    ? window.SAMELCO_MUNICIPALITIES
    : municipalities;

  // Nav: Municipalities dropdown – simple list
  var municipalitiesTrigger = document.getElementById('nav-municipalities-trigger');
  var municipalitiesDropdown = document.getElementById('nav-municipalities-dropdown');
  var municipalitiesListEl = document.getElementById('nav-municipalities-list');
  if (municipalitiesTrigger && municipalitiesDropdown && municipalitiesListEl) {
    municipalityDataset.forEach(function (m) {
      var item = document.createElement('div');
      item.className = 'nav-municipal-item';
      item.textContent = m.name;
      municipalitiesListEl.appendChild(item);
    });
    municipalitiesTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = municipalitiesDropdown.classList.toggle('is-open');
      municipalitiesTrigger.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', function (e) {
      if (!municipalitiesTrigger.contains(e.target) && !municipalitiesDropdown.contains(e.target)) {
        municipalitiesDropdown.classList.remove('is-open');
        municipalitiesTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Nav: three-dot menu toggle
  const navTrigger = document.querySelector('.nav-menu-trigger');
  const navButtons = document.getElementById('nav-dropdown');
  if (navTrigger && navButtons) {
    navTrigger.addEventListener('click', function () {
      const isOpen = navButtons.classList.toggle('is-open');
      navTrigger.setAttribute('aria-expanded', isOpen);
      navTrigger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
    document.addEventListener('click', function (e) {
      if (!navTrigger.contains(e.target) && !navButtons.contains(e.target)) {
        navButtons.classList.remove('is-open');
        navTrigger.setAttribute('aria-expanded', 'false');
        navTrigger.setAttribute('aria-label', 'Open menu');
      }
    });
    navButtons.querySelectorAll('.nav-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navButtons.classList.remove('is-open');
        navTrigger.setAttribute('aria-expanded', 'false');
        navTrigger.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  // Carousel dots: sync with 15s animation (3 slides, 5s each)
  const dots = document.querySelectorAll('.carousel-dot');
  if (dots.length) {
    let idx = 0;
    setInterval(function () {
      dots.forEach(function (d) { d.classList.remove('active'); });
      dots[idx].classList.add('active');
      idx = (idx + 1) % dots.length;
    }, 5000);
  }

  var supabaseCfg = window.SAMELCO_SUPABASE || {};
  const tabs = document.querySelectorAll('.tab');
  const loginForm = document.getElementById('login-form');
  const teamLoginForm = document.getElementById('team-login-form');
  const personnelLoginForm = document.getElementById('personnel-login-form');
  const signupForm = document.getElementById('signup-form');
  const loginEmailEl = document.getElementById('login-email');
  const loginPasswordEl = document.getElementById('login-password');
  const teamLoginEmailEl = document.getElementById('team-login-email');
  const teamLoginPasswordEl = document.getElementById('team-login-password');
  const personnelLoginEmailEl = document.getElementById('personnel-login-email');
  const personnelLoginPasswordEl = document.getElementById('personnel-login-password');
  const signupNameEl = document.getElementById('signup-name');
  const signupEmailEl = document.getElementById('signup-email');
  const signupContactEl = document.getElementById('signup-contact');
  const signupAccountNumberEl = document.getElementById('signup-account-number');
  const signupMunicipalityEl = document.getElementById('signup-municipality');
  const signupBarangayEl = document.getElementById('signup-barangay');
  const signupPasswordEl = document.getElementById('signup-password');
  const signupConfirmPasswordEl = document.getElementById('signup-confirm-password');
  const authForms = [
    { key: 'login', form: loginForm },
    { key: 'team', form: teamLoginForm },
    { key: 'personnel', form: personnelLoginForm },
    { key: 'signup', form: signupForm }
  ];

  function fillSelectOptions(selectEl, values, placeholder) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    var emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = placeholder;
    emptyOpt.selected = true;
    emptyOpt.disabled = true;
    emptyOpt.hidden = true;
    selectEl.appendChild(emptyOpt);

    values.forEach(function (value) {
      var opt = document.createElement('option');
      opt.value = value;
      opt.textContent = value;
      selectEl.appendChild(opt);
    });
  }

  function onSignupMunicipalityChange() {
    if (!signupMunicipalityEl || !signupBarangayEl) return;
    var selected = signupMunicipalityEl.value;
    var muni = municipalityDataset.find(function (m) { return m.name === selected; });
    var barangays = muni && Array.isArray(muni.barangays) ? muni.barangays : [];
    var barangayNames = barangays.map(function(b) {
      return (b && typeof b === 'object' && b.name) ? b.name : b;
    });
    fillSelectOptions(signupBarangayEl, barangayNames, 'Select barangay');
    signupBarangayEl.disabled = !barangayNames.length;
    if (!barangayNames.length) signupBarangayEl.value = '';
  }

  function initSignupLocationOptions() {
    if (!signupMunicipalityEl || !signupBarangayEl) return;
    var municipalityNames = municipalityDataset.map(function (m) { return m.name; });
    fillSelectOptions(signupMunicipalityEl, municipalityNames, 'Select municipality');
    fillSelectOptions(signupBarangayEl, [], 'Select barangay');
    signupBarangayEl.disabled = true;
    signupMunicipalityEl.addEventListener('change', onSignupMunicipalityChange);
  }

  function activateAuthTab(target) {
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-tab') === target);
    });
    authForms.forEach(function (entry) {
      if (!entry.form) return;
      var isActive = entry.key === target;
      entry.form.classList.toggle('active', isActive);
      entry.form.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  function setCustomerSession(user) {
    if (!user || typeof user !== 'object') return;
    localStorage.setItem('userName', user.full_name || user.email || 'Customer');
    localStorage.setItem('userRole', 'user');
    localStorage.removeItem('teamSession');
    localStorage.removeItem('personnelSession');
    localStorage.setItem('customerSession', JSON.stringify({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      contact_number: user.contact_number || '',
      account_number: user.account_number || '',
      municipality: user.municipality || '',
      barangay: user.barangay || '',
      created_at: user.created_at || '',
      last_login_at: user.last_login_at || ''
    }));
  }

  function setTeamSession(team) {
    if (!team || typeof team !== 'object') return;
    localStorage.setItem('userName', team.team_name || team.dashboard_email || 'Team');
    localStorage.setItem('userRole', 'team');
    localStorage.removeItem('customerSession');
    localStorage.removeItem('personnelSession');
    localStorage.setItem('teamSession', JSON.stringify({
      team_id: team.team_id,
      team_name: team.team_name,
      dashboard_email: team.dashboard_email || '',
      description: team.description || '',
      is_active: typeof team.is_active === 'boolean' ? team.is_active : true,
      created_at: team.created_at || '',
      last_login_at: team.last_login_at || ''
    }));
  }

  function setPersonnelSession(personnel) {
    if (!personnel || typeof personnel !== 'object') return;
    localStorage.setItem('userName', personnel.full_name || personnel.email || 'Personnel');
    localStorage.setItem('userRole', 'personnel');
    localStorage.removeItem('customerSession');
    localStorage.removeItem('teamSession');
    localStorage.setItem('personnelSession', JSON.stringify({
      id: personnel.id,
      full_name: personnel.full_name,
      email: personnel.email || '',
      team_id: personnel.team_id || '',
      team_name: personnel.team_name || '',
      is_active: typeof personnel.is_active === 'boolean' ? personnel.is_active : true,
      created_at: personnel.created_at || '',
      last_login_at: personnel.last_login_at || ''
    }));
  }

  function extractRpcErrorMessage(payload, status) {
    if (payload && typeof payload === 'object') {
      if (payload.message) return String(payload.message);
      if (payload.error) return String(payload.error);
      if (payload.hint) return String(payload.hint);
    }
    if (typeof payload === 'string' && payload.trim()) return payload.trim();
    return 'HTTP ' + status;
  }

  async function callSupabaseRpc(functionName, payload) {
    if (!supabaseCfg.url || !supabaseCfg.anonKey) {
      throw new Error('Supabase config is missing.');
    }
    var response = await fetch(supabaseCfg.url + '/rest/v1/rpc/' + functionName, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseCfg.anonKey,
        Authorization: 'Bearer ' + supabaseCfg.anonKey
      },
      body: JSON.stringify(payload)
    });
    var rawText = '';
    try { rawText = await response.text(); } catch (e) {}
    var parsed = null;
    if (rawText) {
      try { parsed = JSON.parse(rawText); } catch (e) { parsed = rawText; }
    }
    if (!response.ok) {
      throw new Error(extractRpcErrorMessage(parsed, response.status));
    }
    return parsed;
  }

  function getFirstRow(data) {
    if (Array.isArray(data)) return data[0] || null;
    return data && typeof data === 'object' ? data : null;
  }

  function buildCustomerAuthErrorMessage(err, fallback) {
    var msg = err && err.message ? String(err.message) : '';
    if (!msg) return fallback;
    if (/Supabase config is missing/i.test(msg)) {
      return 'Customer login is not configured on this page.';
    }
    if (/register_customer_user|login_customer_user|not find the function|404/i.test(msg)) {
      return 'Customer auth SQL is missing. Run the customer auth migration in Supabase first.';
    }
    if (/already registered/i.test(msg)) {
      return msg;
    }
    if (/invalid email or password/i.test(msg)) {
      return 'Invalid email or password.';
    }
    return fallback + ': ' + msg;
  }

  function buildTeamAuthErrorMessage(err, fallback) {
    var msg = err && err.message ? String(err.message) : '';
    if (!msg) return fallback;
    if (/Supabase config is missing/i.test(msg)) {
      return 'Team login is not configured on this page.';
    }
    if (/login_team_dashboard|not find the function|404/i.test(msg)) {
      return 'Team dashboard SQL is missing. Run sql/migrations/20260324_add_team_dashboard_accounts.sql in Supabase first.';
    }
    if (/invalid email or password/i.test(msg)) {
      return 'Invalid team email or password.';
    }
    if (/inactive/i.test(msg)) {
      return msg;
    }
    return fallback + ': ' + msg;
  }

  function buildPersonnelAuthErrorMessage(err, fallback) {
    var msg = err && err.message ? String(err.message) : '';
    if (!msg) return fallback;
    if (/Supabase config is missing/i.test(msg)) {
      return 'Personnel login is not configured on this page.';
    }
    if (/login_personnel_account|not find the function|404/i.test(msg)) {
      return 'Personnel SQL is missing. Run sql/migrations/20260324_add_personnel_accounts.sql in Supabase first.';
    }
    if (/invalid email or password/i.test(msg)) {
      return 'Invalid personnel email or password.';
    }
    if (/inactive/i.test(msg)) {
      return msg;
    }
    return fallback + ': ' + msg;
  }

  initSignupLocationOptions();

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activateAuthTab(this.getAttribute('data-tab'));
    });
  });

  activateAuthTab('login');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = loginEmailEl ? loginEmailEl.value.trim() : '';
      const normalizedEmail = email.toLowerCase();
      const password = loginPasswordEl ? loginPasswordEl.value : '';

      if (normalizedEmail === 'admin' && password === 'admin123') {
        localStorage.setItem('userName', 'Admin');
        localStorage.setItem('userRole', 'admin');
        localStorage.removeItem('customerSession');
        localStorage.removeItem('teamSession');
        localStorage.removeItem('personnelSession');
        window.location.href = 'dashboard.html';
        return;
      }

      try {
        var loginResult = await callSupabaseRpc('login_customer_user', {
          p_email: normalizedEmail,
          p_password: password
        });
        var user = getFirstRow(loginResult);
        if (!user) {
          throw new Error('Invalid email or password');
        }
        setCustomerSession(user);
        window.location.href = 'user-dashboard.html';
      } catch (err) {
        alert(buildCustomerAuthErrorMessage(err, 'Failed to login'));
      }
    });
  }

  if (teamLoginForm) {
    teamLoginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = teamLoginEmailEl ? teamLoginEmailEl.value.trim() : '';
      const normalizedEmail = email.toLowerCase();
      const password = teamLoginPasswordEl ? teamLoginPasswordEl.value : '';

      try {
        var loginResult = await callSupabaseRpc('login_team_dashboard', {
          p_email: normalizedEmail,
          p_password: password
        });
        var team = getFirstRow(loginResult);
        if (!team) {
          throw new Error('Invalid email or password');
        }
        setTeamSession(team);
        window.location.href = 'team-dashboard.html';
      } catch (err) {
        alert(buildTeamAuthErrorMessage(err, 'Failed to login to the team dashboard'));
      }
    });
  }

  if (personnelLoginForm) {
    personnelLoginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = personnelLoginEmailEl ? personnelLoginEmailEl.value.trim() : '';
      const normalizedEmail = email.toLowerCase();
      const password = personnelLoginPasswordEl ? personnelLoginPasswordEl.value : '';

      try {
        var loginResult = await callSupabaseRpc('login_personnel_account', {
          p_email: normalizedEmail,
          p_password: password
        });
        var personnel = getFirstRow(loginResult);
        if (!personnel) {
          throw new Error('Invalid email or password');
        }
        setPersonnelSession(personnel);
        window.location.href = 'personnel-dashboard.html';
      } catch (err) {
        alert(buildPersonnelAuthErrorMessage(err, 'Failed to login to the personnel dashboard'));
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const name = signupNameEl ? signupNameEl.value.trim() : '';
      const email = signupEmailEl ? signupEmailEl.value.trim() : '';
      const normalizedEmail = email.toLowerCase();
      const contactNumber = signupContactEl ? signupContactEl.value.trim() : '';
      const accountNumber = signupAccountNumberEl ? signupAccountNumberEl.value.trim() : '';
      const municipality = signupMunicipalityEl ? signupMunicipalityEl.value : '';
      const barangay = signupBarangayEl ? signupBarangayEl.value : '';
      const password = signupPasswordEl ? signupPasswordEl.value : '';
      const confirmPassword = signupConfirmPasswordEl ? signupConfirmPasswordEl.value : '';

      if (!name || !normalizedEmail || !contactNumber || !accountNumber || !municipality || !barangay) {
        alert('Please complete all customer registration fields.');
        return;
      }
      if (password.length < 8) {
        alert('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }

      try {
        var registerResult = await callSupabaseRpc('register_customer_user', {
          p_full_name: name,
          p_email: normalizedEmail,
          p_password: password,
          p_account_number: accountNumber,
          p_contact_number: contactNumber,
          p_municipality: municipality,
          p_barangay: barangay
        });
        var createdUser = getFirstRow(registerResult);
        if (!createdUser) {
          throw new Error('Account creation failed');
        }
        setCustomerSession(createdUser);
        signupForm.reset();
        fillSelectOptions(signupBarangayEl, [], 'Select barangay');
        if (signupBarangayEl) signupBarangayEl.disabled = true;
        alert('Customer account created successfully.');
        window.location.href = 'user-dashboard.html';
      } catch (err) {
        alert(buildCustomerAuthErrorMessage(err, 'Failed to create customer account'));
      }
    });
  }
});

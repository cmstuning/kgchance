<?php

$csvFile = fopen('./laukianciuju_eileje_ataskaita.csv', 'r');
$jsonFile = fopen('../src/assets/raw-data.json', 'w+');

$isInit = true;
$props = [];
$data = [];

while (($cswRowData = fgetcsv($csvFile, 100000, ';')) !== FALSE) {
  if ($isInit) {
    $isInit = FALSE;
    // Don't process headers
    continue;
  }

  $skipRecord = FALSE;

  $record = [];

  $record['id'] = $cswRowData[0];
  $record['personalNo'] = $cswRowData[3];

  $record['priorities'] = [
    strtolower($cswRowData[7]) === 'taip',
    strtolower($cswRowData[8]) === 'taip',
    strtolower($cswRowData[9]) === 'taip',
    strtolower($cswRowData[10]) === 'taip',
  ];

  $choices = [];

  for ($i = 11; $i < 61; $i += 10) {
    if (isset($cswRowData[$i+5]) && !empty($cswRowData[$i+5]) && strtolower($cswRowData[$i+5]) !== 'nuo 1,5 iki 3 metų') {
      $skipRecord = TRUE;
      break;
    }

    if (isset($cswRowData[$i]) && isset($cswRowData[$i+1])) {
      $choices[] = [
        'garden' => $cswRowData[$i],
        'place' => intval($cswRowData[$i+1]),
      ];
    }
  }

  if ($skipRecord) {
    continue;
  }

  $record['choices'] = $choices;

  $data[] = $record;
}

fwrite($jsonFile, json_encode($data));
fclose($jsonFile);
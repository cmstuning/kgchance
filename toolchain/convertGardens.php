<?php

$csvFile = fopen('./darzeliai_grupes.csv', 'r');
$jsonFile = fopen('../src/assets/gardens.json', 'w+');

$isInit = true;
$props = [];
$data = [];

while (($cswRowData = fgetcsv($csvFile, 100000, ';')) !== FALSE) {
  if ($isInit) {
    $isInit = FALSE;
    // Don't process headers
    continue;
  }

  if (strtolower($cswRowData[6]) === 'nuo 1,5 iki 3 metų') {
    $data[] = [
      'garden' => $cswRowData[0],
      'quota' => intval($cswRowData[9])
    ];
  }
}

fwrite($jsonFile, json_encode($data));
fclose($jsonFile);
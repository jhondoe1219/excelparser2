# excelparser strem service 2

Оптимизация:

1) Потоковая передача файла сразу на второй сервер (Busboy)
2) Запись mongo bulkWrite
3) Оптимизация построчного чтения excel невозможна, так как он является архивом

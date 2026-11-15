// Opções fixas usadas nos formulários e filtros.

export const ESPECIES = [
  { value: 'cao', label: 'Cão' },
  { value: 'gato', label: 'Gato' },
  { value: 'outro', label: 'Outro' },
]

export const SEXOS = [
  { value: 'femea', label: 'Fêmea' },
  { value: 'macho', label: 'Macho' },
]

// Tipos de registro da carteira de saúde (RN17) e os campos de cada um
export const RECORD_TYPES = [
  {
    value: 'vacina',
    label: 'Vacinas',
    singular: 'Vacina',
    icon: 'shield',
    tituloLabel: 'Nome da vacina',
    tituloPlaceholder: 'Ex.: V10, Antirrábica',
    dataLabel: 'Data da aplicação',
    proximaLabel: 'Próxima dose',
    fields: [
      { key: 'lote', label: 'Lote' },
      { key: 'fabricante', label: 'Fabricante' },
    ],
  },
  {
    value: 'consulta',
    label: 'Consultas',
    singular: 'Consulta',
    icon: 'activity',
    tituloLabel: 'Motivo da consulta',
    tituloPlaceholder: 'Ex.: Check-up anual',
    dataLabel: 'Data da consulta',
    proximaLabel: 'Retorno',
    fields: [
      { key: 'veterinario', label: 'Veterinário(a)' },
      { key: 'crmv', label: 'CRMV' },
      { key: 'clinica', label: 'Clínica' },
      { key: 'diagnostico', label: 'Diagnóstico', multiline: true },
    ],
  },
  {
    value: 'medicamento',
    label: 'Medicamentos',
    singular: 'Medicamento',
    icon: 'package',
    tituloLabel: 'Nome do medicamento',
    tituloPlaceholder: 'Ex.: Vermífugo',
    dataLabel: 'Início',
    proximaLabel: 'Fim do tratamento',
    fields: [
      { key: 'dosagem', label: 'Dosagem', placeholder: 'Ex.: 1 comprimido' },
      { key: 'intervalo_horas', label: 'Intervalo (horas)', keyboard: 'number-pad', placeholder: 'Ex.: 12' },
    ],
  },
  {
    value: 'exame',
    label: 'Exames',
    singular: 'Exame',
    icon: 'clipboard',
    tituloLabel: 'Nome do exame',
    tituloPlaceholder: 'Ex.: Hemograma',
    dataLabel: 'Data de realização',
    proximaLabel: null,
    fields: [
      { key: 'laboratorio', label: 'Laboratório' },
      { key: 'resultado', label: 'Resultado', multiline: true },
    ],
  },
  {
    value: 'castracao',
    label: 'Castração',
    singular: 'Castração',
    icon: 'scissors',
    tituloLabel: 'Procedimento',
    tituloPlaceholder: 'Castração',
    dataLabel: 'Data da cirurgia',
    proximaLabel: 'Retirada dos pontos',
    fields: [
      { key: 'veterinario', label: 'Veterinário(a)' },
      { key: 'clinica', label: 'Clínica ou mutirão' },
    ],
  },
]

export const recordType = (value) => RECORD_TYPES.find((t) => t.value === value) || RECORD_TYPES[0]

// Tipos de alerta comunitário (RN25)
export const ALERT_TYPES = [
  { value: 'perdido', label: 'Perdido', titulo: 'Animal perdido', color: '#2F6FD6', bg: '#E6EFFD' },
  { value: 'abandonado', label: 'Abandonado', titulo: 'Animal abandonado', color: '#B97300', bg: '#FFF3D1' },
  { value: 'risco', label: 'Em risco', titulo: 'Animal em risco', color: '#D64545', bg: '#FDE8E8' },
]
export const alertType = (value) => ALERT_TYPES.find((t) => t.value === value) || ALERT_TYPES[0]

// Categorias de serviços e campanhas
export const PLACE_CATEGORIES = [
  { value: 'clinica', label: 'Clínicas', icon: 'plus-square' },
  { value: 'vacinacao', label: 'Vacinação', icon: 'shield' },
  { value: 'castracao', label: 'Castração', icon: 'scissors' },
  { value: 'adocao', label: 'Adoção', icon: 'heart' },
  { value: 'ong', label: 'ONGs', icon: 'users' },
]
export const placeCategory = (value) => PLACE_CATEGORIES.find((c) => c.value === value) || PLACE_CATEGORIES[0]
